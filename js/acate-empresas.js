"use strict";
(() => {
  const registry = [
    {id:"inovatech",name:"InovaTech SC",segment:"Tecnologia / IoT",cnpj:"44.555.666/0001-33",owner:"André Luiz Pereira",status:"Aprovada",statusLabel:"Aprovada",size:"Média",acate:true},
    {id:"sc-digital",name:"SC Digital Solutions",segment:"E-commerce",cnpj:"77.888.999/0001-55",owner:"Patrícia Mendes",status:"Inativada",statusLabel:"Inativada",size:"Pequena",acate:true},
    {id:"techcorp",name:"TechCorp Soluções",segment:"Tecnologia / SaaS",cnpj:"12.345.678/0001-90",owner:"Carlos Eduardo",status:"Solicitação",statusLabel:"Solicitado em 28/09/26",size:"Média",acate:true,reviewAction:"Ver solicitação",request:{name:"Carlos Eduardo Ferreira",role:"CTO · Solicitado em 28/09/26",phone:"(48) 99999-1234",email:"carlos@techcorp.com.br"}},
    {id:"datasoft",name:"DataSoft Ltda.",segment:"Cloud / Infra",cnpj:"98.765.432/0001-10",owner:"Fernanda Lima",status:"Solicitação",statusLabel:"2 Solicitações",size:"Grande",acate:true},
    {id:"finansc",name:"FinanSC",segment:"Fintech",cnpj:"33.444.555/0001-22",owner:"Juliana Martins",status:"Solicitação",statusLabel:"Aguardando aprovação",size:"Pequena",acate:true,reviewAction:"Rever solicitação",request:{name:"Juliana Martins",role:"Diretora Comercial · Solicitado em 28/09/26",phone:"(48) 99876-5432",email:"juliana@finansc.com.br"}},
    {id:"cloudsc",name:"CloudSC Tecnologia",segment:"Cloud / Infra",cnpj:"11.222.333/0001-44",owner:"Marcos Souza",status:"Solicitação após recusa",statusLabel:"Ressolicitado em 28/09/26",size:"Média",acate:true,reviewAction:"Rever solicitação",request:{name:"Juliana Martins",role:"Diretora Comercial · Solicitado em 28/09/26",phone:"(48) 99876-5432",email:"email.example@email.com"}},
    {id:"oldtech",name:"OldTech Sistemas",segment:"ERP / Consultoria",cnpj:"55.666.777/0001-88",owner:"Múltiplos responsáveis",status:"Recusada",statusLabel:"Recusada",size:"Microempresa",acate:true},
    {id:"nuvem-sul",name:"Nuvem Sul",segment:"Cloud Computing",cnpj:"22.333.444/0001-09",owner:"Amanda Oliveira",status:"Aprovada",statusLabel:"Aprovada",size:"Pequena",acate:true},
    {id:"horizonte",name:"Horizonte Dados",segment:"Dados / BI",cnpj:"66.777.888/0001-42",owner:"Rafael Nunes",status:"Aprovada",statusLabel:"Aprovada",size:"Microempresa",acate:true},
    {id:"ilha-tech",name:"Ilha Tech",segment:"Desenvolvimento",cnpj:"88.999.000/0001-77",owner:"Beatriz Lima",status:"Inativada",statusLabel:"Inativada",size:"Grande",acate:true},
    {id:"fora-1",name:"Empresa não associada",segment:"Varejo",cnpj:"10.000.000/0001-10",owner:"Contato privado",status:"Aprovada",statusLabel:"Aprovada",size:"Pequena",acate:false}
  ];
  const companies = registry.filter(company => company.acate);
  const state = {query:"",status:"",sizes:new Set(),page:1,pageSize:7};
  const search = document.getElementById("acate-company-search");
  const body = document.getElementById("acate-company-body");
  const wrap = document.querySelector(".acate-companies__table-wrap");
  const empty = document.getElementById("acate-company-empty");
  const count = document.getElementById("acate-company-count");
  const pagination = document.getElementById("acate-company-pagination");
  const statusTrigger = document.getElementById("acate-status-trigger");
  const sizeTrigger = document.getElementById("acate-size-trigger");
  const statusPanel = document.getElementById("acate-status-options");
  const sizePanel = document.getElementById("acate-size-options");
  const reviewDialog = document.getElementById("acate-request-dialog");
  const decisionDialog = document.getElementById("acate-decision-dialog");
  const resultDialog = document.getElementById("acate-result-dialog");
  const toast = document.getElementById("toast");
  let toastTimer;
  let reviewCompany = null;
  let reviewOrigin = null;
  let decisionOrigin = null;
  let decisionAction = null;
  let resultCompanyId = null;

  const normalize = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const statusClass = status => status === "Aprovada" ? "approved" : status === "Inativada" ? "inactive" : status === "Recusada" ? "rejected" : "request";

  function filteredCompanies() {
    const query = normalize(state.query.trim());
    return companies.filter(company => {
      const searchable = normalize(`${company.name} ${company.cnpj} ${company.owner} ${company.segment}`);
      return (!query || searchable.includes(query))
        && (!state.status || company.status === state.status)
        && (!state.sizes.size || state.sizes.has(company.size));
    });
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function eyeIcon() {
    const icon = document.createElement("img");
    icon.src = "../assets/admin-figma/TablerIconsEye.svg";
    icon.alt = "";
    icon.width = 16;
    icon.height = 16;
    return icon;
  }

  function createRow(company) {
    const row = document.createElement("tr");
    row.dataset.companyId = company.id;
    const companyCell = element("td");
    companyCell.append(element("strong", "acate-company__name", company.name), element("span", "acate-company__segment", company.segment));
    const cnpj = element("td", "", company.cnpj);
    const owner = element("td", "", company.owner);
    const statusCell = element("td");
    statusCell.append(element("span", `acate-company__status acate-company__status--${statusClass(company.status)}`, company.statusLabel));
    const actions = element("td", "acate-company__actions");
    const actionGroup = element("div", "acate-company__action-group");
    if (["Aprovada", "Inativada"].includes(company.status)) {
      const edit = element("a", "acate-company__edit");
      edit.href = `acate-empresa-editar.html?company=${encodeURIComponent(company.id)}`;
      edit.title = "Editar";
      edit.setAttribute("aria-label", `Editar ${company.name}`);
      const editIcon = document.createElement("img");
      editIcon.src = "../assets/admin-figma/TablerIconsPencil.svg";
      editIcon.alt = "";editIcon.width = 20;editIcon.height = 20;
      edit.append(editIcon);
      const reset = element("button", "acate-company__reset");
      reset.type = "button";reset.dataset.companyReset = company.id;reset.title = "Resetar senha";
      reset.setAttribute("aria-label", `Resetar senha de ${company.name}`);
      const lockIcon = document.createElement("img");
      lockIcon.src = "../assets/admin-figma/LucideIconsLockKeyhole.svg";
      lockIcon.alt = "";lockIcon.width = 20;lockIcon.height = 20;reset.append(lockIcon);
      const toggle = element("label", "toggle");
      toggle.title = company.status === "Aprovada" ? "Inativar" : "Ativar";
      const input = document.createElement("input");
      input.type = "checkbox";input.role = "switch";input.dataset.companyToggle = company.id;input.checked = company.status === "Aprovada";
      input.setAttribute("aria-label", `${company.status === "Aprovada" ? "Inativar" : "Ativar"} ${company.name}`);
      toggle.append(input, element("span", "toggle__slider"));
      actionGroup.append(edit, reset, toggle);
    } else if (company.request) {
      const review = element("button", "acate-company__review");
      review.type = "button";
      review.dataset.reviewCompany = company.id;
      review.setAttribute("aria-label", `${company.reviewAction} de ${company.name}`);
      review.append(eyeIcon(), document.createTextNode(company.reviewAction));
      actionGroup.append(review);
    } else {
      const link = element("a", "acate-company__details");
      link.href = `acate-empresa-perfil.html?company=${encodeURIComponent(company.id)}`;
      link.setAttribute("aria-label", `Ver detalhes de ${company.name}`);
      link.append(eyeIcon(), document.createTextNode("Ver detalhes"));
      actionGroup.append(link);
    }
    actions.append(actionGroup);
    row.append(companyCell, cnpj, owner, statusCell, actions);
    return row;
  }

  function pageButton(target, label, content, disabled = false, current = false) {
    const button = element("button", "", content);
    button.type = "button";
    button.dataset.page = String(target);
    button.disabled = disabled;
    button.setAttribute("aria-label", label);
    if (current) button.setAttribute("aria-current", "page");
    return button;
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / state.pageSize);
    pagination.replaceChildren();
    pagination.hidden = pages <= 1;
    if (pages <= 1) return;
    pagination.append(pageButton(state.page - 1, "Página anterior", "‹", state.page === 1));
    for (let page = 1; page <= pages; page += 1) pagination.append(pageButton(page, `Página ${page}`, String(page), false, page === state.page));
    pagination.append(element("span", "", `de ${pages}`), pageButton(state.page + 1, "Próxima página", "›", state.page === pages));
  }

  function updateFilterLabels() {
    statusTrigger.querySelector("span").textContent = state.status || "Todos os status";
    statusTrigger.classList.toggle("is-filled", Boolean(state.status));
    const sizes = [...state.sizes];
    sizeTrigger.querySelector("span").textContent = sizes.length === 0 ? "Todos os portes" : sizes.length === 1 ? sizes[0] : `${sizes.length} portes`;
    sizeTrigger.classList.toggle("is-filled", sizes.length > 0);
    statusPanel.querySelectorAll("[data-status]").forEach(option => option.setAttribute("aria-selected", String(option.dataset.status === state.status)));
    sizePanel.querySelector("[data-clear-sizes]").disabled = sizes.length === 0;
  }

  function render() {
    const filtered = filteredCompanies();
    const pages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * state.pageSize;
    body.replaceChildren(...filtered.slice(start, start + state.pageSize).map(createRow));
    count.innerHTML = `Exibindo <strong>${filtered.length}</strong> ${filtered.length === 1 ? "empresa" : "empresas"}`;
    const none = filtered.length === 0;
    wrap.hidden = none;
    count.hidden = none;
    empty.hidden = !none;
    renderPagination(filtered.length);
    updateFilterLabels();
  }

  function setPanel(panel, open, restoreFocus = false) {
    const trigger = panel === statusPanel ? statusTrigger : sizeTrigger;
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) trigger.focus();
  }

  function closePanels(except) {
    if (except !== statusPanel) setPanel(statusPanel, false);
    if (except !== sizePanel) setPanel(sizePanel, false);
  }

  function clearFilters() {
    state.query = "";
    state.status = "";
    state.sizes.clear();
    state.page = 1;
    search.value = "";
    sizePanel.querySelectorAll("[data-size]").forEach(input => { input.checked = false; });
    closePanels();
    render();
    search.focus();
  }

  function openReview(company, origin) {
    reviewCompany = company;
    reviewOrigin = origin;
    const title = document.getElementById("acate-request-title");
    const strong = document.createElement("strong");
    strong.textContent = company.name;
    title.replaceChildren(document.createTextNode("Solicitações de Acesso - "), strong);
    document.getElementById("acate-request-cnpj").textContent = company.cnpj;
    document.getElementById("acate-request-person").textContent = company.request.name;
    document.getElementById("acate-request-role").textContent = company.request.role;
    document.getElementById("acate-request-phone").textContent = company.request.phone;
    document.getElementById("acate-request-email").textContent = company.request.email;
    document.getElementById("acate-request-notes").value = "";
    document.body.classList.add("is-request-open");
    reviewDialog.showModal();
    reviewDialog.querySelector("[data-close-request]").focus();
  }

  function closeReview(restoreFocus = true) {
    if (reviewDialog.open) reviewDialog.close();
    document.body.classList.remove("is-request-open");
    if (restoreFocus && reviewOrigin?.isConnected) reviewOrigin.focus();
  }

  const decisions = {
    approve:{title:"Confirmar aprovação da empresa?",description:"Ao aprovar, a empresa será notificada por e-mail e terá seu cadastro aprovado.",label:"Confirmar aprovação"},
    reject:{title:"Confirmar recusa da empresa?",description:"Tem certeza de que deseja recusar esta empresa? Ao confirmar, a empresa será notificada por e-mail sobre a decisão.",label:"Confirmar recusa"}
  };

  function openDecision(action, origin) {
    decisionAction = action;
    decisionOrigin = origin;
    const content = decisions[action];
    decisionDialog.dataset.mode = action;
    document.getElementById("acate-decision-title").textContent = content.title;
    document.getElementById("acate-decision-description").textContent = content.description;
    const confirm = document.getElementById("acate-decision-confirm");
    confirm.textContent = content.label;
    confirm.dataset.action = action;
    decisionDialog.showModal();
    decisionDialog.querySelector("[data-close-decision]").focus();
  }

  function closeDecision(restoreFocus = true) {
    if (decisionDialog.open) decisionDialog.close();
    if (restoreFocus && decisionOrigin?.isConnected) decisionOrigin.focus();
    decisionAction = null;
    decisionOrigin = null;
  }

  function showResult(action, companyId) {
    resultCompanyId = companyId;
    resultDialog.dataset.mode = action;
    document.getElementById("acate-result-title").textContent = action === "approve" ? "Empresa aprovada!" : "Empresa recusada";
    document.getElementById("acate-result-description").textContent = action === "approve"
      ? "Um e-mail de confirmação foi enviado para a empresa."
      : "Um e-mail informando a decisão foi enviado para a empresa.";
    resultDialog.showModal();
    document.getElementById("acate-result-close").focus();
  }

  function closeResult() {
    if (resultDialog.open) resultDialog.close();
    const focusTarget = body.querySelector(`[data-company-id="${resultCompanyId}"] a, [data-company-id="${resultCompanyId}"] button`);
    (focusTarget || search).focus();
    resultCompanyId = null;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 3000);
  }

  const companyAction = {type:null, company:null, opener:null};
  function actionDialog(type) {
    return document.getElementById(type === "reset" ? "company-reset-dialog" : "company-deactivate-dialog");
  }
  function openCompanyAction(type, company, opener) {
    companyAction.type = type;companyAction.company = company;companyAction.opener = opener;
    if (type === "deactivate") document.getElementById("company-deactivate-name").textContent = company.name;
    const dialog = actionDialog(type);dialog.showModal();dialog.querySelector("[data-close-company-action]").focus();
  }
  function closeCompanyAction(restoreFocus = true) {
    const dialog = actionDialog(companyAction.type);if (dialog?.open) dialog.close();
    if (restoreFocus && companyAction.opener?.isConnected) companyAction.opener.focus();
    companyAction.type = null;companyAction.company = null;companyAction.opener = null;
  }
  function focusManagedCompany(id) {
    (body.querySelector(`[data-company-toggle="${id}"]`) || search).focus();
  }

  document.getElementById("acate-company-filters").addEventListener("submit", event => event.preventDefault());
  search.addEventListener("input", () => { state.query = search.value; state.page = 1; render(); });
  statusTrigger.addEventListener("click", () => {
    const open = statusPanel.hidden;
    closePanels(open ? statusPanel : undefined);
    setPanel(statusPanel, open);
    if (open) statusPanel.querySelector("[data-status]")?.focus();
  });
  sizeTrigger.addEventListener("click", () => {
    const open = sizePanel.hidden;
    closePanels(open ? sizePanel : undefined);
    setPanel(sizePanel, open);
    if (open) sizePanel.querySelector("input")?.focus();
  });
  statusPanel.addEventListener("click", event => {
    const option = event.target.closest("[data-status]");
    if (option) {
      state.status = option.dataset.status;
      state.page = 1;
      setPanel(statusPanel, false, true);
      render();
    } else if (event.target.closest("[data-clear-status]")) {
      state.status = "";
      state.page = 1;
      setPanel(statusPanel, false, true);
      render();
    }
  });
  sizePanel.addEventListener("change", event => {
    const input = event.target.closest("[data-size]");
    if (!input) return;
    if (input.checked) state.sizes.add(input.value); else state.sizes.delete(input.value);
    state.page = 1;
    render();
  });
  sizePanel.querySelector("[data-clear-sizes]").addEventListener("click", () => {
    state.sizes.clear();
    sizePanel.querySelectorAll("[data-size]").forEach(input => { input.checked = false; });
    state.page = 1;
    render();
    sizePanel.querySelector("input")?.focus();
  });
  pagination.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    render();
    pagination.querySelector('[aria-current="page"]')?.focus();
  });
  body.addEventListener("click", event => {
    const reset = event.target.closest("[data-company-reset]");
    if (reset) {
      const company = companies.find(item => item.id === reset.dataset.companyReset);
      if (company && ["Aprovada", "Inativada"].includes(company.status)) openCompanyAction("reset", company, reset);
      return;
    }
    const button = event.target.closest("[data-review-company]");
    if (!button) return;
    const company = companies.find(item => item.id === button.dataset.reviewCompany);
    if (company?.request) openReview(company, button);
  });
  body.addEventListener("change", event => {
    const input = event.target.closest("[data-company-toggle]");
    if (!input) return;
    const company = companies.find(item => item.id === input.dataset.companyToggle);
    if (!company || !["Aprovada", "Inativada"].includes(company.status)) return;
    if (!input.checked) {
      input.checked = true;
      openCompanyAction("deactivate", company, input);
      return;
    }
    company.status = "Aprovada";company.statusLabel = "Aprovada";
    render();focusManagedCompany(company.id);
    showToast(`${company.name} reativada. Alteração simulada neste protótipo.`);
  });
  document.getElementById("acate-clear-filters").addEventListener("click", clearFilters);
  document.addEventListener("click", event => { if (!event.target.closest(".acate-filter")) closePanels(); });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || reviewDialog.open || decisionDialog.open || resultDialog.open) return;
    if (!statusPanel.hidden) setPanel(statusPanel, false, true);
    else if (!sizePanel.hidden) setPanel(sizePanel, false, true);
  });

  reviewDialog.querySelector("[data-close-request]").addEventListener("click", () => closeReview());
  reviewDialog.addEventListener("click", event => { if (event.target === reviewDialog) closeReview(); });
  reviewDialog.addEventListener("cancel", event => { event.preventDefault(); closeReview(); });
  document.getElementById("acate-request-approve").addEventListener("click", event => openDecision("approve", event.currentTarget));
  document.getElementById("acate-request-reject").addEventListener("click", event => openDecision("reject", event.currentTarget));
  decisionDialog.querySelectorAll("[data-close-decision]").forEach(button => button.addEventListener("click", () => closeDecision()));
  decisionDialog.addEventListener("click", event => { if (event.target === decisionDialog) closeDecision(); });
  decisionDialog.addEventListener("cancel", event => { event.preventDefault(); closeDecision(); });
  document.getElementById("acate-decision-confirm").addEventListener("click", () => {
    if (!reviewCompany || !decisionAction) return;
    const action = decisionAction;
    const companyId = reviewCompany.id;
    reviewCompany.status = action === "approve" ? "Aprovada" : "Recusada";
    reviewCompany.statusLabel = reviewCompany.status;
    delete reviewCompany.request;
    delete reviewCompany.reviewAction;
    closeDecision(false);
    closeReview(false);
    render();
    showResult(action, companyId);
  });
  document.getElementById("acate-result-close").addEventListener("click", closeResult);
  resultDialog.addEventListener("cancel", event => { event.preventDefault(); closeResult(); });

  document.querySelectorAll("[data-close-company-action]").forEach(button => button.addEventListener("click", () => closeCompanyAction()));
  document.querySelectorAll(".company-action-dialog").forEach(dialog => {
    dialog.addEventListener("click", event => { if (event.target === dialog) closeCompanyAction(); });
    dialog.addEventListener("cancel", event => { event.preventDefault(); closeCompanyAction(); });
  });
  document.getElementById("company-reset-submit").addEventListener("click", () => {
    const company = companyAction.company;closeCompanyAction();
    if (company) showToast(`Redefinição simulada para ${company.name}. Nenhuma senha foi alterada e nenhum e-mail foi enviado.`);
  });
  document.getElementById("company-deactivate-submit").addEventListener("click", () => {
    const company = companyAction.company;if (!company) return;
    closeCompanyAction(false);company.status = "Inativada";company.statusLabel = "Inativada";
    render();focusManagedCompany(company.id);
    showToast(`${company.name} inativada. Alteração simulada neste protótipo.`);
  });

  render();
})();
