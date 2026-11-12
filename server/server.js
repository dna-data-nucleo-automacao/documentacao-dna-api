// Servidor da documentação: serve as páginas estáticas somente para quem fez login.
//
// Variáveis de ambiente:
//   LOGIN_USER / LOGIN_PASS  credenciais de acesso (obrigatórias; sem elas ninguém entra)
//   SESSION_SECRET           opcional: chave do cookie de sessão (padrão: derivada da senha)
//   SESSION_HOURS            opcional: duração da sessão em horas (padrão: 1)
//   PORT                     opcional: porta local (padrão: 3000)
const express = require('express');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COOKIE_NAME = 'dna_auth';
const SESSION_HOURS = Number(process.env.SESSION_HOURS) > 0 ? Number(process.env.SESSION_HOURS) : 1;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;

// limite de tentativas de login por IP (proteção contra força bruta)
const MAX_TENTATIVAS = 10;
const JANELA_TENTATIVAS_MS = 15 * 60 * 1000;
const tentativas = new Map();

// arquivos acessíveis sem login (só a própria tela de login)
const PUBLIC_FILES = new Set(['/auth/login.html', '/auth/login.css', '/auth/login.js']);

// nada fora da documentação é servido (código do servidor, dependências, configs)
const BLOQUEADOS = /^\/(server|node_modules|api)(\/|$)|^\/(package(-lock)?\.json|vercel\.json)$|^\/\./i;

function credenciais() {
  return {
    user: process.env.LOGIN_USER || '',
    pass: process.env.LOGIN_PASS || ''
  };
}

function chaveSessao() {
  // Sem SESSION_SECRET, deriva da senha: estável entre reinícios/instâncias e,
  // ao trocar a senha, todas as sessões abertas deixam de valer.
  const segredo = process.env.SESSION_SECRET || ('dna-doc-api:' + credenciais().pass);
  return crypto.createHash('sha256').update(segredo).digest();
}

function assinar(valor) {
  return crypto.createHmac('sha256', chaveSessao()).update(valor).digest('base64url');
}

function iguais(a, b) {
  // comparação em tempo constante (não revela por tempo de resposta onde a string difere)
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function criarToken() {
  const expira = Date.now() + SESSION_MS;
  const payload = expira + '.' + crypto.randomBytes(16).toString('hex');
  return payload + '.' + assinar(payload);
}

function tokenValido(token) {
  if (typeof token !== 'string') return false;
  const partes = token.split('.');
  if (partes.length !== 3) return false;

  const payload = partes[0] + '.' + partes[1];
  if (!iguais(assinar(payload), partes[2])) return false;

  return Number(partes[0]) > Date.now();
}

function lerCookie(req, nome) {
  const header = req.headers.cookie || '';
  for (const parte of header.split(';')) {
    const i = parte.indexOf('=');
    if (i < 0) continue;
    if (parte.slice(0, i).trim() === nome) {
      try {
        return decodeURIComponent(parte.slice(i + 1).trim());
      } catch (e) {
        return '';
      }
    }
  }
  return '';
}

function opcoesCookie(req) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure, // https (na Vercel, via trust proxy)
    maxAge: SESSION_MS,
    path: '/'
  };
}

function autenticado(req) {
  return tokenValido(lerCookie(req, COOKIE_NAME));
}

function destinoSeguro(next) {
  // só aceita caminhos internos (evita redirecionar para outro site após o login)
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return '/index.html';
  }
  return next;
}

function bloqueadoPorTentativas(ip) {
  const agora = Date.now();
  const reg = tentativas.get(ip);
  if (!reg || agora - reg.inicio > JANELA_TENTATIVAS_MS) return false;
  return reg.falhas >= MAX_TENTATIVAS;
}

function registrarFalha(ip) {
  const agora = Date.now();
  const reg = tentativas.get(ip);
  if (!reg || agora - reg.inicio > JANELA_TENTATIVAS_MS) {
    tentativas.set(ip, { inicio: agora, falhas: 1 });
  } else {
    reg.falhas++;
  }
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// páginas de documentação não devem ficar em cache compartilhado
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.post('/login', (req, res) => {
  const ip = req.ip || 'desconhecido';

  if (bloqueadoPorTentativas(ip)) {
    return res.status(429).json({ ok: false, message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });
  }

  const esperado = credenciais();
  if (!esperado.user || !esperado.pass) {
    console.error('LOGIN_USER/LOGIN_PASS não configurados: login bloqueado.');
    return res.status(503).json({ ok: false, message: 'Acesso não configurado no servidor.' });
  }

  const { user, pass } = req.body || {};
  const userOk = iguais(user || '', esperado.user);
  const passOk = iguais(pass || '', esperado.pass);

  if (userOk && passOk) {
    tentativas.delete(ip);
    res.cookie(COOKIE_NAME, criarToken(), opcoesCookie(req));
    return res.json({ ok: true, next: destinoSeguro(req.query.next) });
  }

  registrarFalha(ip);
  return res.status(401).json({ ok: false, message: 'Usuário ou senha incorretos.' });
});

app.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ ok: true });
});

// Proteção: tudo exige login, exceto os arquivos da tela de login
app.use((req, res, next) => {
  if (BLOQUEADOS.test(req.path)) {
    return res.status(404).send('Not found');
  }

  if (PUBLIC_FILES.has(req.path)) {
    // já logado e abrindo o login: vai direto para a documentação
    if (req.path === '/auth/login.html' && autenticado(req)) {
      return res.redirect('/index.html');
    }
    return next();
  }

  if (autenticado(req)) return next();

  // páginas: manda para o login, voltando para a página pedida depois
  if (req.method === 'GET' && (req.accepts(['html', 'json']) === 'html')) {
    return res.redirect('/auth/login.html?next=' + encodeURIComponent(req.originalUrl));
  }

  return res.status(401).json({ ok: false, message: 'Não autenticado.' });
});

app.use(express.static(ROOT, { index: 'index.html', dotfiles: 'deny' }));

app.use((req, res) => res.status(404).send('Not found'));

// Local: `npm start`. Na Vercel o app é exportado e executado como função (ver vercel.json).
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    if (!credenciais().user || !credenciais().pass) {
      console.warn('ATENÇÃO: defina LOGIN_USER e LOGIN_PASS; sem elas ninguém consegue entrar.');
    }
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
