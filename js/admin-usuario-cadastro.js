"use strict";
// Cadastrar Administrador (protótipo): o envio é simulado. Nada é salvo e nenhum e-mail é enviado.
(() => {
  const form = document.getElementById("user-create-form");
  const toast = document.getElementById("toast");
  const submit = form.querySelector('button[type="submit"]');

  function returnToUsers() {
    try {
      if (window.parent !== window && window.parent.location.origin === location.origin && window.parent.document.getElementById("sctec-content")) {
        window.parent.location.hash = "#/sctec/admin/users";
        return;
      }
    } catch { /* fora do viewer: navegação direta */ }
    location.href = "admin-usuarios.html";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    submit.disabled = true;
    toast.textContent = "Administrador cadastrado. Credenciais enviadas por e-mail.";
    toast.classList.add("toast--visible");
    setTimeout(returnToUsers, 1500);
  });
})();
