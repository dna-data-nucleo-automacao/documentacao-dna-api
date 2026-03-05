// Simple static server that serves files and exposes /env.js with selected env vars
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Authentication middleware: protect all routes except /auth/* and /env.js
app.use((req, res, next) => {
  const publicPaths = [
    '/env.js',
  ];

  // Allow full access to /auth folder (login page, styles, scripts)
  if (req.path.startsWith('/auth/') || publicPaths.includes(req.path)) {
    return next();
  }

  // Check authentication cookie
  const auth = req.cookies && req.cookies.dna_auth;
  if (auth === '1') return next();

  // Not authenticated: redirect to login
  return res.redirect('/auth/login.html');
});

// Serve the project root (one level up from this server file)
app.use(express.static(path.join(__dirname, '..')));

app.get('/env.js', (req, res) => {
  const env = {
    LOGIN_USER: process.env.LOGIN_USER || '',
    LOGIN_PASS: process.env.LOGIN_PASS || ''
  };
  res.set('Content-Type', 'application/javascript');
  res.send('window.__ENV__ = ' + JSON.stringify(env) + ';');
});

// Login endpoint: validate credentials and set cookie
app.post('/login', (req, res) => {
  const { user, pass } = req.body || {};
  const expectedUser = process.env.LOGIN_USER || 'admin';
  const expectedPass = process.env.LOGIN_PASS || 'password';

  if (user === expectedUser && pass === expectedPass) {
    // set cookie (httpOnly)
    res.cookie('dna_auth', '1', { httpOnly: true, maxAge: 1000 * 60 * 60 });
    return res.json({ ok: true });
  }

  return res.status(401).json({ ok: false, message: 'Credenciais inválidas' });
});

// Logout endpoint: clear cookie
app.post('/logout', (req, res) => {
  res.clearCookie('dna_auth');
  return res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
