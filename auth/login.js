// login.js - valida credenciais usando window.__ENV__ (exposto por /env.js)
(function(){
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');

  function safeTrim(s){return (s||'').toString().trim();}

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const user = safeTrim(document.getElementById('user').value);
    const pass = safeTrim(document.getElementById('pass').value);

    // send credentials to server for verification
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    }).then(async res => {
      if (res.ok) {
        window.location.href = '../index.html';
      } else {
        const body = await res.json().catch(()=>({}));
        msg.textContent = body.message || 'Usuário ou senha incorretos.';
        setTimeout(()=> msg.textContent = '', 4000);
      }
    }).catch(()=>{
      msg.textContent = 'Erro de conexão.';
      setTimeout(()=> msg.textContent = '', 4000);
    });
  });
})();
