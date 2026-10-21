"use strict";
/*
  Gestão de Usuários (protótipo): dados fictícios e determinísticos, tudo em memória.
  Nenhuma senha é alterada, nenhum e-mail é enviado e nada é salvo; recarregar restaura os exemplos.
*/
(() => {
  const users = [
    {id: "joao", name: "João Silva", email: "joao.silva@email.com", cpf: "012.345.678-90", status: "Ativo"},
    {id: "maria", name: "Maria Luísa Fernandes", email: "maria.fernandes@email.com", cpf: "098.765.432-10", status: "Ativo"},
    {id: "pedro", name: "Pedro Rodrigues", email: "pedro.rodrigues@email.com", cpf: "111.222.333-44", status: "Inativo"}
  ];

  const body = document.getElementById("user-table-body");
  const tableWrap = document.querySelector(".admin-users__table-wrap");
  const search = document.getElementById("user-search");
  const clear = document.getElementById("user-search-clear");
  const searchIcon = document.querySelector(".admin-users__search-icon");
  const status = document.getElementById("user-status");
  const empty = document.getElementById("user-empty");
  const count = document.getElementById("user-result-count");
  const toast = document.getElementById("toast");
  const dialogs = {reset: document.getElementById("user-reset-dialog"), deactivate: document.getElementById("user-deactivate-dialog")};
  let searchTerm = "";
  let statusFilter = "";
  let toastTimer;
  let dialogState = null;

  const normalize = value => String(value).toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const digits = value => String(value).replace(/\D/g, "");

  function filteredUsers() {
    const query = normalize(searchTerm.trim());
    const queryDigits = digits(searchTerm);
    return users.filter(user => {
      const matchesText = !query
        || normalize(`${user.name} ${user.email}`).includes(query)
        || (queryDigits.length > 0 && digits(user.cpf).includes(queryDigits));
      return matchesText && (!statusFilter || user.status === statusFilter);
    });
  }

  function cell(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  function iconButton(label, icon, attribute, userId) {
    const button = cell("button", "action-icon");
    button.type = "button";
    button.title = label.split(" ")[0] === "Redefinir" ? "Resetar senha" : "Editar";
    button.setAttribute("aria-label", label);
    button.dataset[attribute] = userId;
    const img = document.createElement("img");
    img.src = `../assets/admin-figma/${icon}.svg`;
    img.alt = "";
    img.width = 20;
    img.height = 20;
    button.append(img);
    return button;
  }

  function createRow(user) {
    const row = document.createElement("tr");
    row.dataset.userRow = user.id;
    const identity = cell("td");
    const name = cell("strong", "admin-user__name");
    name.textContent = user.name;
    const email = cell("span", "admin-user__email");
    email.textContent = user.email;
    identity.append(name, email);
    const cpf = cell("td");
    cpf.textContent = user.cpf;
    const statusCell = cell("td");
    const badge = cell("span", `admin-user__status admin-user__status--${user.status === "Ativo" ? "active" : "inactive"}`);
    badge.textContent = user.status;
    statusCell.append(badge);
    const actions = cell("td");
    const group = cell("div", "action-group");
    const toggle = cell("label", "toggle");
    toggle.title = user.status === "Ativo" ? "Inativar" : "Ativar";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("role", "switch");
    input.dataset.userToggle = user.id;
    input.checked = user.status === "Ativo";
    input.setAttribute("aria-label", `${user.status === "Ativo" ? "Inativar" : "Ativar"} ${user.name}`);
    toggle.append(input, cell("span", "toggle__slider"));
    group.append(iconButton(`Editar ${user.name}`, "TablerIconsPencil", "userEdit", user.id), iconButton(`Redefinir senha de ${user.name}`, "LucideIconsLockKeyhole", "userReset", user.id), toggle);
    actions.append(group);
    row.append(identity, cpf, statusCell, actions);
    return row;
  }

  function render() {
    const hasText = search.value.length > 0;
    clear.hidden = !hasText;
    searchIcon.hidden = hasText;
    status.classList.toggle("is-filled", status.value !== "");
    const filtered = filteredUsers();
    body.replaceChildren(...filtered.map(createRow));
    empty.hidden = filtered.length > 0;
    tableWrap.hidden = filtered.length === 0;
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "administrador encontrado" : "administradores encontrados"}.`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 3000);
  }

  function openDialog(type, user, opener) {
    dialogState = {type, user, opener};
    dialogs[type].querySelector("[data-user-name]").textContent = user.name;
    dialogs[type].showModal();
    dialogs[type].querySelector("[data-close-user-dialog]").focus();
  }

  function closeDialog() {
    if (!dialogState) return;
    const {type, opener} = dialogState;
    dialogs[type].close();
    dialogState = null;
    if (opener?.isConnected) opener.focus();
  }

  const byId = id => users.find(user => user.id === id);

  search.addEventListener("input", () => { searchTerm = search.value; render(); });
  status.addEventListener("change", () => { statusFilter = status.value; render(); });
  document.getElementById("user-filters").addEventListener("submit", event => event.preventDefault());
  clear.addEventListener("click", () => { search.value = ""; searchTerm = ""; render(); search.focus(); });
  document.getElementById("user-clear-filters").addEventListener("click", () => {
    search.value = "";
    status.value = "";
    searchTerm = "";
    statusFilter = "";
    render();
    search.focus();
  });

  body.addEventListener("click", event => {
    const edit = event.target.closest("[data-user-edit]");
    if (edit) { const user = byId(edit.dataset.userEdit); if (user) showToast(`Edição de ${user.name} simulada neste protótipo. Nenhum dado foi alterado.`); return; }
    const reset = event.target.closest("[data-user-reset]");
    if (reset) { const user = byId(reset.dataset.userReset); if (user) openDialog("reset", user, reset); }
  });

  body.addEventListener("change", event => {
    const input = event.target.closest("[data-user-toggle]");
    const user = input && byId(input.dataset.userToggle);
    if (!user) return;
    if (!input.checked) {
      // Inativar pede confirmação; o switch só muda depois dela.
      input.checked = true;
      openDialog("deactivate", user, input);
      return;
    }
    user.status = "Ativo";
    render();
    body.querySelector(`[data-user-toggle="${user.id}"]`)?.focus();
    showToast(`${user.name} reativado. Alteração simulada neste protótipo.`);
  });

  document.querySelectorAll("[data-close-user-dialog]").forEach(button => button.addEventListener("click", closeDialog));
  Object.values(dialogs).forEach(dialog => {
    dialog.addEventListener("cancel", event => { event.preventDefault(); closeDialog(); });
    dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  });

  document.getElementById("user-reset-submit").addEventListener("click", () => {
    const user = dialogState?.user;
    closeDialog();
    if (user) showToast(`Redefinição simulada para ${user.name}. Nenhuma senha foi alterada e nenhum e-mail foi enviado.`);
  });

  document.getElementById("user-deactivate-submit").addEventListener("click", () => {
    const user = dialogState?.user;
    if (!user) return;
    user.status = "Inativo";
    dialogState.opener = null;
    closeDialog();
    render();
    body.querySelector(`[data-user-toggle="${user.id}"]`)?.focus();
    showToast(`${user.name} inativado. Alteração simulada neste protótipo.`);
  });

  render();
})();
