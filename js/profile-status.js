"use strict";

(() => {
  const toggle = document.querySelector(".profile-status input, .company-profile-status input");
  if (!toggle) return;
  const isCompany = Boolean(toggle.closest(".company-profile-status"));
  const copy = isCompany
    ? {
      modal: "Seu perfil deixará de ficar visível para os candidatos. As informações da empresa serão preservadas e você pode reativar o perfil quando quiser.",
      off: "O perfil da empresa não está mais visível para os candidatos.",
      on: "O perfil da empresa está visível para os candidatos."
    }
    : {
      modal: "Seu perfil deixará de ficar visível para as empresas. Suas informações serão preservadas e você pode reativar o perfil quando quiser.",
      off: "Seu perfil profissional não está mais visível para as empresas.",
      on: "Seu perfil profissional está visível para as empresas."
    };

  const dialog = document.createElement("dialog");
  dialog.className = "status-dialog";
  dialog.setAttribute("aria-labelledby", "status-dialog-title");
  dialog.innerHTML = '<div class="status-dialog__card"><div class="status-dialog__header"><h2 id="status-dialog-title">Deseja desativar seu perfil?</h2>'
    + '<button type="button" class="status-dialog__close" data-cancel aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>'
    + '<p></p><div class="status-dialog__actions"><button type="button" class="status-dialog__button" data-cancel>Cancelar</button>'
    + '<button type="button" class="status-dialog__button status-dialog__button--primary" data-confirm>Desativar perfil</button></div></div>';
  dialog.querySelector("p").textContent = copy.modal;
  document.body.appendChild(dialog);

  const toast = document.createElement("div");
  toast.className = "status-toast";
  toast.setAttribute("role", "status");
  toast.hidden = true;
  document.body.appendChild(toast);
  let timer;

  function showToast(title, text) {
    toast.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg><div><strong></strong><span></span></div>';
    toast.querySelector("strong").textContent = title;
    toast.querySelector("span").textContent = text;
    toast.hidden = false;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { toast.hidden = true; }, 4000);
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      showToast("Perfil Ativado com sucesso", copy.on);
      return;
    }
    toggle.checked = true;
    dialog.showModal();
  });

  dialog.querySelectorAll("[data-cancel]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector("[data-confirm]").addEventListener("click", () => {
    toggle.checked = false;
    showToast("Perfil Desativado com sucesso", copy.off);
    dialog.close();
  });
  dialog.addEventListener("close", () => toggle.focus());
})();
