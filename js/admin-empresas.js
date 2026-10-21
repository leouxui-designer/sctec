"use strict";

// Dados fictícios de demonstração; classificações ACATE existentes preservadas.
const companies = [
  {
    "id": "inovatech",
    "name": "InovaTech SC",
    "segment": "Tecnologia / IoT",
    "cnpj": "44.555.666/0001-33",
    "responsible": "André Luiz Pereira",
    "email": "andre@inovatech.sc",
    "acate": "Sim",
    "status": "Aprovada",
    "size": "Média",
    "action": "manage",
    "statusLabel": "Ativa"
  },
  {
    "id": "sc-digital",
    "name": "SC Digital Solutions",
    "segment": "E-commerce",
    "cnpj": "77.888.999/0001-55",
    "responsible": "Patrícia Mendes",
    "email": "patricia@scdigital.com.br",
    "acate": "Não",
    "status": "Inativada",
    "size": "Pequena",
    "action": "manage",
    "statusLabel": "Inativa"
  },
  {
    "id": "techcorp",
    "name": "TechCorp Soluções",
    "segment": "Tecnologia / SaaS",
    "cnpj": "12.345.678/0001-90",
    "responsible": "Carlos Eduardo",
    "email": "carlos@techcorp.com.br",
    "acate": "Sim",
    "status": "Solicitação",
    "size": "Média",
    "action": "Ver solicitação",
    "statusLabel": "Solicitado em 28/09/26"
  },
  {
    "id": "datasoft",
    "name": "DataSoft Ltda.",
    "segment": "Cloud / Infra",
    "cnpj": "98.765.432/0001-10",
    "responsible": "Fernanda Lima",
    "email": "fernanda@datasoft.com.br",
    "acate": "Não",
    "status": "Solicitação",
    "size": "Média",
    "action": "Ver solicitações",
    "statusLabel": "2 Solicitações"
  },
  {
    "id": "finansc",
    "name": "FinanSC",
    "segment": "Fintech",
    "cnpj": "33.444.555/0001-22",
    "responsible": "Juliana Martins",
    "email": "juliana@finansc.com.br",
    "acate": "Não informado",
    "status": "Solicitação",
    "size": "Pequena",
    "action": "Rever solicitação",
    "statusLabel": "Aguardando aprovação da ACATE"
  },
  {
    "id": "cloudsc",
    "name": "CloudSC Tecnologia",
    "segment": "Cloud / Infra",
    "cnpj": "11.222.333/0001-44",
    "responsible": "Marcos Souza",
    "email": "roberto@cloudsc.com.br",
    "acate": "Sim",
    "status": "Ressolicitação",
    "size": "Grande",
    "action": "Rever solicitação",
    "statusLabel": "Ressolicitado em 28/09/26"
  },
  {
    "id": "oldtech",
    "name": "OldTech Sistemas",
    "segment": "ERP / Consultoria",
    "cnpj": "55.666.777/0001-88",
    "responsible": "Múltiplos responsáveis",
    "email": "marcos@oldtech.com.br",
    "acate": "Não",
    "status": "Recusada",
    "size": "Microempresa",
    "action": "Ver detalhes",
    "statusLabel": "Recusada"
  },
  {
    "id": "nexussc",
    "name": "NexusSC Digital",
    "segment": "Tecnologia / SaaS",
    "cnpj": "22.333.444/0001-66",
    "responsible": "Beatriz Souza",
    "email": "beatriz@nexussc.com.br",
    "acate": "Sim",
    "status": "Recusada",
    "size": "Pequena",
    "action": "manage"
  },
  {
    "id": "safetech",
    "name": "SafeTech Brasil",
    "segment": "Cibersegurança",
    "cnpj": "66.777.888/0001-11",
    "responsible": "Rafael Costa",
    "email": "rafael@safetech.com.br",
    "acate": "Sim",
    "status": "Aprovada",
    "size": "Grande",
    "action": "manage"
  },
  {
    "id": "dadosul",
    "name": "DadoSul",
    "segment": "Análise de Dados",
    "cnpj": "10.111.222/0001-33",
    "responsible": "Camila Rocha",
    "email": "camila@dadosul.com.br",
    "acate": "Não",
    "status": "Aprovada",
    "size": "Pequena",
    "action": "manage"
  },
  {
    "id": "orbit",
    "name": "Orbit Sistemas",
    "segment": "ERP / Consultoria",
    "cnpj": "20.222.333/0001-44",
    "responsible": "Lucas Martins",
    "email": "lucas@orbit.com.br",
    "acate": "Não",
    "status": "Inativada",
    "size": "Média",
    "action": "manage"
  },
  {
    "id": "verde",
    "name": "Verde Labs",
    "segment": "Tecnologia / IoT",
    "cnpj": "30.333.444/0001-55",
    "responsible": "Ana Beatriz",
    "email": "ana@verdelabs.com.br",
    "acate": "Sim",
    "status": "Aprovada",
    "size": "Microempresa",
    "action": "manage"
  },
  {
    "id": "ponte",
    "name": "Ponte Tech",
    "segment": "E-commerce",
    "cnpj": "40.444.555/0001-66",
    "responsible": "Diego Lima",
    "email": "diego@pontetech.com.br",
    "acate": "Não",
    "status": "Solicitação",
    "size": "Pequena",
    "action": "request-single"
  },
  {
    "id": "farol",
    "name": "Farol Digital",
    "segment": "Fintech",
    "cnpj": "50.555.666/0001-77",
    "responsible": "Marina Alves",
    "email": "marina@faroldigital.com.br",
    "acate": "Não informado",
    "status": "Recusada",
    "size": "Média",
    "action": "manage"
  }
];

const pageSize = 7;
let currentPage = 1;
let searchTerm = "";
let statusFilter = "";
let sizeFilter = "";
let acateOnly = false;
let toastTimer;

const body = document.getElementById("company-table-body");
const emptyState = document.getElementById("company-empty");
const count = document.getElementById("company-result-count");
const pagination = document.getElementById("company-pagination");
const search = document.getElementById("company-search");
const status = document.getElementById("company-status");
const size = document.getElementById("company-size");
const acate = document.getElementById("company-acate");

const icons = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  request: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function statusClass(value) {
  return ({ Aprovada: "approved", Inativada: "inactive", Solicitação: "request", Ressolicitação: "resubmission", Recusada: "rejected" })[value] || "inactive";
}

function statusLabel(value) {
  return ({ Aprovada: "Ativa", Inativada: "Inativa" })[value] || value;
}

function canToggleCompany(company) {
  return company.action === "manage" && ["Aprovada", "Inativada"].includes(company.status);
}

function actionMarkup(company) {
  if (company.action !== "manage") {
    const label = ({"request-single":"Ver solicitação","request-multiple":"Ver solicitações"})[company.action] || company.action;
    return `<button class="admin-company__request" type="button" data-company-id="${company.id}" data-deferred-action="${escapeHtml(company.action)}"><img src="../assets/admin-figma/TablerIconsEye.svg" alt="" width="16" height="16">${escapeHtml(label)}</button>`;
  }
  return `<a class="action-icon" href="admin-empresa-editar.html?company=${encodeURIComponent(company.id)}" title="Editar" aria-label="Editar ${escapeHtml(company.name)}"><img src="../assets/admin-figma/TablerIconsPencil.svg" alt="" width="20" height="20"></a>
    <button class="action-icon" type="button" data-company-reset="${company.id}" title="Resetar senha" aria-label="Resetar senha de ${escapeHtml(company.name)}"><img src="../assets/admin-figma/LucideIconsLockKeyhole.svg" alt="" width="20" height="20"></button>
    ${canToggleCompany(company) ? `<label class="toggle" title="${company.status === "Aprovada" ? "Inativar" : "Ativar"}"><input type="checkbox" data-company-toggle="${company.id}" ${company.status === "Aprovada" ? "checked" : ""} aria-label="${company.status === "Aprovada" ? "Inativar" : "Ativar"} ${escapeHtml(company.name)}"><span class="toggle__slider"></span></label>` : ""}`;
}

function filteredCompanies() {
  const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
  return companies.filter((company) => {
    const haystack = [company.name, company.cnpj, company.responsible, company.email, company.segment].join(" ").toLocaleLowerCase("pt-BR");
    return (!query || haystack.includes(query)) && (!statusFilter || company.status === statusFilter) && (!sizeFilter || company.size === sizeFilter) && (!acateOnly || company.acate === "Sim");
  });
}

function renderRows(filtered) {
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  body.innerHTML = visible.map((company) => `<tr data-company-row="${company.id}">
    <td><strong class="admin-company__name">${escapeHtml(company.name)}</strong><span class="admin-company__meta">${escapeHtml(company.segment)}</span></td>
    <td>${escapeHtml(company.cnpj)}</td>
    <td>${escapeHtml(company.responsible)}</td>
    <td>${escapeHtml(company.acate)}</td>
    <td><span class="admin-company__status admin-company__status--${company.statusLabel === "Aguardando aprovação da ACATE" ? "acate" : statusClass(company.status)}">${escapeHtml(statusLabel(company.statusLabel || company.status))}</span></td>
    <td><div class="action-group">${actionMarkup(company)}</div></td>
  </tr>`).join("");
  emptyState.hidden = filtered.length > 0;
  emptyState.setAttribute("aria-hidden", String(filtered.length > 0));
  document.querySelector(".admin-companies__table").hidden = filtered.length === 0;
  document.querySelector(".admin-companies__table-wrap").hidden = filtered.length === 0;
}

function renderPagination(total) {
  pagination.hidden = total === 0;
  if (total === 0) {
    currentPage = 1;
    pagination.replaceChildren();
    return;
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const buttons = [`<button class="pagination__btn pagination__btn--arrow" type="button" data-page="${currentPage - 1}" aria-label="Página anterior" ${currentPage === 1 ? "disabled" : ""}>${icons.chevronLeft}</button>`];
  for (let page = 1; page <= totalPages; page += 1) {
    buttons.push(`<button class="pagination__btn ${page === currentPage ? "pagination__btn--active" : ""}" type="button" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`);
  }
  buttons.push(`<span class="pagination__info">de ${totalPages}</span>`);
  buttons.push(`<button class="pagination__btn pagination__btn--arrow" type="button" data-page="${currentPage + 1}" aria-label="Próxima página" ${currentPage === totalPages ? "disabled" : ""}>${icons.chevronRight}</button>`);
  pagination.innerHTML = buttons.join("");
}

function syncSearchAction() {
  const hasText = search.value.length > 0;
  document.querySelector(".admin-companies__search-icon").hidden = hasText;
  document.getElementById("company-search-clear").hidden = !hasText;
}

function render() {
  syncSearchAction();
  const filtered = filteredCompanies();
  count.hidden = filtered.length === 0;
  count.textContent = `Exibindo ${filtered.length} ${filtered.length === 1 ? "empresa" : "empresas"}`;
  renderPagination(filtered.length);
  renderRows(filtered);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("toast--visible"), 3000);
}

search?.addEventListener("input", (event) => { searchTerm = event.target.value; currentPage = 1; render(); });
document.getElementById("company-search-clear")?.addEventListener("click", () => {
  search.value = "";
  searchTerm = "";
  currentPage = 1;
  render();
  search.focus();
});
document.getElementById("company-clear-filters")?.addEventListener("click", () => {
  search.value = "";
  status.value = "";
  size.value = "";
  acate.checked = false;
  searchTerm = "";
  statusFilter = "";
  sizeFilter = "";
  acateOnly = false;
  currentPage = 1;
  render();
  // The activated button is now hidden; return focus to the first cleared field.
  search.focus();
});
status?.addEventListener("change", (event) => { statusFilter = event.target.value; currentPage = 1; render(); });
size?.addEventListener("change", (event) => { sizeFilter = event.target.value; currentPage = 1; render(); });
acate?.addEventListener("change", (event) => { acateOnly = event.target.checked; currentPage = 1; render(); });
document.getElementById("company-filters")?.addEventListener("submit", event => event.preventDefault());

pagination?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;
  currentPage = Number(button.dataset.page);
  render();
  pagination.querySelector(`[data-page="${currentPage}"][aria-current="page"]`)?.focus();
});

const requestReview = window.createCompanyRequestReview({
  getCompany: id => companies.find(company => company.id === id),
  onCommit: (company, decision) => {
    company.review = decision.review;
    if (decision.review.acateChanged) company.acate = decision.review.acate ? "Sim" : "Não";
    if (decision.type === "approve") {
      company.status = "Aprovada";
      company.statusLabel = "Ativa";
      company.action = "manage";
      company.responsible = decision.responsible.name;
      company.email = decision.responsible.email;
    } else if (decision.type === "reject") {
      company.status = "Recusada";
      company.statusLabel = "Recusada";
      company.action = "Ver detalhes";
    } else {
      company.status = "Solicitação";
      company.statusLabel = "Aguardando aprovação da ACATE";
      company.action = "Rever solicitação";
    }
    render();
    showToast(decision.type === "approve" ? "Empresa aprovada! Decisão simulada neste protótipo." : decision.type === "reject" ? "Empresa recusada. Decisão simulada neste protótipo." : "Empresa encaminhada para aprovação da ACATE. Envio simulado.");
  }
});

body?.addEventListener("click", (event) => {
  const reset = event.target.closest("[data-company-reset]");
  if (reset) openCompanyAction("reset", reset.dataset.companyReset, reset);
  const deferred = event.target.closest("[data-deferred-action]");
  if (deferred) {
    const company = companies.find(item => item.id === deferred.dataset.companyId);
    if (company?.action === "Ver detalhes") showToast("Visualização de detalhes ainda não disponível neste protótipo.");
    else if (company) requestReview.open(company.id, deferred);
  }
  const toastButton = event.target.closest("[data-toast]");
  if (toastButton && toastButton.tagName !== "INPUT") showToast(toastButton.dataset.toast);
});

body?.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-company-toggle]");
  if (!input) return;
  const company = companies.find(item => item.id === input.dataset.companyToggle);
  if (!company || !canToggleCompany(company)) return;
  if (!input.checked) {
    input.checked = true;
    openCompanyAction("deactivate", company.id, input);
    return;
  }
  company.status = input.checked ? "Aprovada" : "Inativada";
  company.statusLabel = statusLabel(company.status);
  render();
  // Rendering reapplies active filters. Restore focus even when the row leaves the results.
  restoreCompanyFocus(company);
  showToast("Status alterado para " + company.status + ".");
});

function restoreCompanyFocus(company) {
  const next = body.querySelector('[data-company-toggle="' + company.id + '"]') || (count.hidden ? document.getElementById("company-clear-filters") : count);
  if (next === count) count.tabIndex = -1;
  next?.focus();
}

render();

const actionState = { type: null, company: null, opener: null };
function openCompanyAction(type, id, opener) {
  const company = companies.find(item => item.id === id);
  const dialog = document.getElementById(type === "reset" ? "company-reset-dialog" : "company-deactivate-dialog");
  if (!company || !dialog || dialog.open) return;
  actionState.type = type; actionState.company = company; actionState.opener = opener;
  if (type === "deactivate") document.getElementById("company-deactivate-name").textContent = company.name;
  dialog.showModal();
  dialog.querySelector("[data-close-action]")?.focus();
}
function closeCompanyAction() {
  const dialog = document.getElementById(actionState.type === "reset" ? "company-reset-dialog" : "company-deactivate-dialog");
  dialog?.close();
  actionState.opener?.focus();
  actionState.type = null; actionState.company = null; actionState.opener = null;
}
document.querySelectorAll("[data-close-action]").forEach(button => button.addEventListener("click", closeCompanyAction));
document.querySelectorAll(".company-action-dialog").forEach(dialog => {
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeCompanyAction(); });
  dialog.addEventListener("click", event => { if (event.target === dialog) closeCompanyAction(); });
});
document.getElementById("company-reset-submit")?.addEventListener("click", () => {
  const company = actionState.company; closeCompanyAction();
  if (company) showToast(`Redefinição simulada para ${company.name}. Nenhuma senha foi alterada e nenhum e-mail foi enviado.`);
});
document.getElementById("company-deactivate-submit")?.addEventListener("click", () => {
  const company = actionState.company; closeCompanyAction();
  if (!company) return;
  company.status = "Inativada"; company.statusLabel = "Inativa"; render();
  restoreCompanyFocus(company);
  showToast(`Empresa ${company.name} inativada. Alteração simulada neste protótipo.`);
});

