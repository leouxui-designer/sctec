"use strict";

// Read-only Figma references and local demo decisions; no backend or persistence.
window.createCompanyRequestReview = function createCompanyRequestReview({ getCompany, onCommit }) {
  const review = document.getElementById('company-review');
  const confirm = document.getElementById('company-confirm');
  const cards = document.getElementById('company-request-cards');
  const association = document.getElementById('company-review-acate');
  const notes = document.getElementById('company-review-notes');
  const approve = document.getElementById('company-review-approve');
  const reject = document.getElementById('company-review-reject');
  const confirmButton = document.getElementById('company-confirm-submit');
  const title = document.getElementById('company-review-title');
  const escape = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]);
  const whatsappHref = value => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '#';
    return 'https://wa.me/' + (digits.startsWith('55') ? digits : (digits.length === 10 || digits.length === 11 ? '55' + digits : digits));
  };
  // Explicit sample scenario from the two-request Figma frames. Not CNPJ grouping logic.
  const applicants = [
    { id:'juliana', name:'Juliana Martins', role:'Diretora Comercial', date:'28/09/26', phone:'(48) 99876-5432', email:'email.example@email.com' },
    { id:'patricia', name:'Patrícia Mendes', role:'Analista de RH', date:'28/09/26', phone:'(48) 99876-5432', email:'email.example@email.com' },
  ];
  const confirmations = {
    approve: { node:'101981:24128', title:'Confirmar aprovação da empresa?', description:'Ao aprovar, a empresa será notificada por e-mail e terá seu cadastro aprovado.', label:'Confirmar aprovação' },
    reject: { node:'101981:24148', title:'Confirmar recusa da empresa?', description:'Tem certeza de que deseja recusar esta empresa? Ao confirmar, a empresa será notificada por e-mail sobre a decisão.', label:'Confirmar recusa' },
    rejectMultiple: { node:'101982:24394', title:'Confirmar recusa da empresa com múltiplas solicitações?', description:'Esta empresa possui mais de uma solicitação de acesso vinculada ao mesmo CNPJ. Ao confirmar a recusa, todas as solicitações serão recusadas e nenhum dos responsáveis receberá acesso à plataforma.', label:'Confirmar recusa' },
    send: { node:'101981:24168', title:'Enviar empresa para aprovação da ACATE?', description:'Ao confirmar, a empresa será encaminhada para análise da ACATE, que ficará responsável por aprovar ou recusar a solicitação.', label:'Enviar para aprovação' },
  };
  let draft = null;
  let trigger = null;
  let decisionTrigger = null;
  let pendingDecision = null;

  function updateActions() {
    const multiple = draft.requests.length > 1;
    association.checked = draft.acate;
    document.getElementById('company-review-acate-value').textContent = draft.acate ? 'Sim' : 'Não';
    // Figma defines the alternative footer for a single request only.
    reject.hidden = !multiple && draft.acate;
    approve.textContent = multiple ? 'Aprovar selecionado' : draft.acate ? 'Enviar para aprovação' : 'Aprovar';
    approve.disabled = multiple && !draft.selectedId;
    review.dataset.figmaNode = multiple ? draft.selectedId ? '101346:13905' : '101337:9077' : draft.acate ? '101981:23961' : '101513:9955';
    for (const card of cards.querySelectorAll('.company-request-card')) {
      card.classList.toggle('company-request-card--selected', multiple && card.dataset.requestId === draft.selectedId);
    }
  }

  function contactMarkup(person) {
    return '<a class="company-request-contact company-request-contact--whatsapp" href="' + escape(whatsappHref(person.phone)) + '" target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp com ' + escape(person.name) + ' pelo número ' + escape(person.phone) + '"><span class="company-request-contact__icon"><img src="../assets/admin-figma/RequestWhatsapp.svg" alt="" width="16" height="16"></span><span><span>WhatsApp</span><strong>' + escape(person.phone) + '</strong></span></a>' +
      '<a class="company-request-contact company-request-contact--email" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=' + encodeURIComponent(String(person.email || '')) + '" target="_blank" rel="noopener noreferrer" aria-label="Enviar e-mail para ' + escape(person.name) + ' em ' + escape(person.email) + '"><span class="company-request-contact__icon"><img src="../assets/admin-figma/RequestEmail.svg" alt="" width="16" height="16"></span><span><span>E-mail</span><strong>' + escape(person.email) + '</strong></span></a>';
  }

  function renderReview() {
    const company = getCompany(draft.companyId);
    const multiple = draft.requests.length > 1;
    title.innerHTML = '<span>Solicitações de Acesso - </span><strong>' + escape(company.name) + '</strong>';
    document.getElementById('company-review-cnpj').textContent = company.cnpj;
    const description = document.getElementById('company-review-description');
    description.innerHTML = multiple ? '<strong>2 candidatos</strong> da ' + escape(company.name) + ' aguardam aprovação. Escolha quem será o responsável, os demais serão recusados e notificados.' : '1 candidato aguarda aprovação:';
    review.dataset.requestKind = company.status === 'Ressolicitação' ? 'resubmission' : 'initial';
    // Date label preserves whether this is an initial request or a resubmission.
    const requestDateLabel = company.status === 'Ressolicitação' ? 'Ressolicitado' : 'Solicitado';
    cards.innerHTML = draft.requests.map(person => {
      const content = '<div class="company-request-card__content"><strong class="company-request-card__name">' + escape(person.name) + '</strong><p class="company-request-card__meta">' + escape(person.role) + ' · ' + requestDateLabel + ' em ' + escape(person.date) + '</p><div class="company-request-card__contacts">' + contactMarkup(person) + '</div></div>';
      return multiple ? '<label class="company-request-card" data-request-id="' + escape(person.id) + '"><input type="radio" name="company-responsible" value="' + escape(person.id) + '" aria-label="Selecionar ' + escape(person.name) + '">' + content + '</label>' : '<div class="company-request-card" data-request-id="' + escape(person.id) + '">' + content + '</div>';
    }).join('');
    notes.value = draft.notes;
    updateActions();
  }

  function restoreTableFocus() {
    if (trigger?.isConnected) { trigger.focus(); return; }
    const row = document.querySelector('[data-company-row="' + draft.companyId + '"]');
    const next = row?.querySelector('button,a,input') || document.querySelector('#company-empty:not([hidden]) button') || document.getElementById('company-result-count');
    if (next) { if (!next.matches('button,a,input')) next.tabIndex = -1; next.focus(); }
  }

  function closeReview() {
    if (confirm.open) cancelDecision();
    if (!review.open) return;
    review.close();
    document.body.classList.remove('company-review-open');
    restoreTableFocus();
    draft = null;
  }

  function cancelDecision() {
    if (confirm.open) confirm.close();
    pendingDecision = null;
    decisionTrigger?.focus();
  }

  function askDecision(type, source) {
    if (!draft || (type === 'approve' && draft.requests.length > 1 && !draft.selectedId)) return;
    const key = type === 'reject' && draft.requests.length > 1 ? 'rejectMultiple' : type;
    const config = confirmations[key];
    pendingDecision = type;
    decisionTrigger = source;
    document.getElementById('company-confirm-title').textContent = config.title;
    document.getElementById('company-confirm-description').textContent = config.description;
    confirmButton.textContent = config.label;
    confirmButton.className = 'company-dialog__button ' + (type === 'reject' ? 'company-dialog__button--destructive' : 'company-dialog__button--primary');
    confirm.dataset.figmaNode = config.node;
    confirm.showModal();
    document.getElementById('company-confirm-cancel').focus();
  }

  // Keep Tab inside the active dialog even at iframe/browser focus boundaries.
  for (const dialog of [review, confirm]) {
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || (dialog === review && confirm.open)) return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length && !el.hidden);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
    });
  }

  review.querySelector('[data-close-review]').addEventListener('click', closeReview);
  review.addEventListener('cancel', event => { event.preventDefault(); closeReview(); });
  confirm.addEventListener('cancel', event => { event.preventDefault(); cancelDecision(); });
  confirm.querySelectorAll('[data-cancel-decision]').forEach(button => button.addEventListener('click', cancelDecision));
  // Native dialogs make the underlying screen inert and keep Tab within the active dialog.
  for (const dialog of [review, confirm]) {
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target !== dialog || (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom)) return;
      if (dialog === confirm) cancelDecision(); else closeReview();
    });
  }
  cards.addEventListener('change', event => {
    if (event.target.name !== 'company-responsible') return;
    draft.selectedId = event.target.value;
    updateActions();
  });
  association.addEventListener('change', () => { draft.acate = association.checked; draft.acateChanged = true; updateActions(); });
  notes.addEventListener('input', () => { draft.notes = notes.value; });
  approve.addEventListener('click', () => askDecision(draft.requests.length === 1 && draft.acate ? 'send' : 'approve', approve));
  reject.addEventListener('click', () => askDecision('reject', reject));
  confirmButton.addEventListener('click', () => {
    if (!draft || !pendingDecision) return;
    const type = pendingDecision;
    pendingDecision = null; // Prevent repeat commits from rapid clicks.
    const responsible = draft.requests.find(person => person.id === draft.selectedId) || draft.requests[0];
    const result = {
      type, responsible,
      review: { notes:draft.notes, acate:draft.acate, acateChanged:draft.acateChanged, selectedId:draft.selectedId, decision:type,
        requests:draft.requests.map(person => ({...person, decision:type === 'approve' ? person.id === responsible.id ? 'Aprovada' : 'Recusada' : type === 'reject' ? 'Recusada' : 'Encaminhada'})) }
    };
    confirm.close();
    onCommit(getCompany(draft.companyId), result);
    closeReview();
  });

  return {
    open(companyId, source) {
      const company = getCompany(companyId);
      if (!company || review.open) return;
      const multiple = company.action === 'Ver solicitações' || company.action === 'request-multiple';
      // The sample contacts come from the confirmed frames; identity/CNPJ come from the clicked row.
      const requests = (multiple ? applicants : applicants.slice(0,1)).map(person => ({...person}));
      draft = { companyId, requests, selectedId:null, acateChanged:false, acate:company.review?.acate ?? company.acate === 'Sim', notes:company.review?.notes || '' };
      trigger = source;
      renderReview();
      document.body.classList.add('company-review-open');
      review.showModal();
      title.focus();
    }
  };
};
