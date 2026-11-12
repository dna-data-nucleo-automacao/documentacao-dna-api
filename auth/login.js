// login.js - envia as credenciais para o servidor validar (nada de senha no navegador)
(function(){
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const btn = form.querySelector('button[type="submit"]');

  function safeTrim(s){return (s||'').toString().trim();}

  function mostrar(texto){
    msg.textContent = texto;
    setTimeout(()=> msg.textContent = '', 4000);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const user = safeTrim(document.getElementById('user').value);
    const pass = document.getElementById('pass').value;

    btn.disabled = true;

    // repassa o ?next= para voltar à página que o usuário tentou abrir
    fetch('/login' + window.location.search, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ user, pass })
    }).then(async res => {
      const body = await res.json().catch(()=>({}));
      if (res.ok) {
        window.location.href = body.next || '/index.html';
      } else {
        mostrar(body.message || 'Usuário ou senha incorretos.');
      }
    }).catch(()=>{
      mostrar('Erro de conexão.');
    }).finally(()=>{
      btn.disabled = false;
    });
  });
})();
