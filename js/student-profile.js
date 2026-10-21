"use strict";

(() => {
  const root = document.querySelector(".student-profile-page");
  if (!root) return;

  const byId = (id) => document.getElementById(id);
  const MAX_SKILLS = 10;
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const ICON_EDIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  const ICON_REMOVE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';
  const ICON_CERT = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-3 4.5 3-1-9"/></svg>';
  const ICON_JOB = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>';
  let toastTimer;
  let activeDialog = null;
  let opener = null;
  let editing = null;
  let pendingRemoval = null;
  let languageCount = 0;

  function showToast(message) {
    const toast = byId("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast--visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("toast--visible"), 3000);
  }

  function toggleAvatarMenu() {
    const menu = byId("avatar-menu");
    const toggle = byId("avatar-toggle");
    if (!menu || !toggle) return;
    const open = !menu.classList.contains("avatar-menu--open");
    menu.classList.toggle("avatar-menu--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  /* ---------- Diálogos ---------- */
  function focusables(dialog) {
    return [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.offsetParent !== null);
  }

  function openDialog(id, trigger) {
    const modal = byId(id);
    if (!modal) return;
    if (activeDialog && activeDialog !== modal) closeDialog({ restoreFocus: false });
    opener = trigger || opener || document.activeElement;
    activeDialog = modal;
    modal.classList.add("modal--open");
    document.body.classList.add("modal-open");
    const content = modal.querySelector(".modal__content");
    (modal.querySelector("input:not([type=checkbox]):not([type=radio]), select, textarea") || content).focus();
  }

  function closeDialog({ restoreFocus = true } = {}) {
    if (!activeDialog) return;
    activeDialog.classList.remove("modal--open");
    document.body.classList.remove("modal-open");
    activeDialog = null;
    editing = null;
    pendingRemoval = null;
    if (restoreFocus && opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  function setFieldError(input, message) {
    const error = input.closest(".profile-field")?.querySelector(".profile-field__error");
    if (message) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    if (!error) return;
    error.hidden = !message;
    error.textContent = message || "";
    error.id = error.id || `${input.id}-error`;
    if (message) input.setAttribute("aria-describedby", error.id); else input.removeAttribute("aria-describedby");
  }

  function clearForm(form) {
    form.reset();
    form.querySelectorAll(".profile-input").forEach((input) => setFieldError(input, ""));
  }

  function validateRequired(inputs) {
    let first = null;
    inputs.forEach((input) => {
      const empty = !input.value.trim();
      setFieldError(input, empty ? "Campo obrigatório." : "");
      if (empty && !first) first = input;
    });
    first?.focus();
    return !first;
  }

  /* ---------- Entradas (certificados e experiências) ---------- */
  function monthLabel(value) {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${MONTHS[Number(month) - 1]} ${year}`;
  }

  function dateLabel(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function actionsMarkup(kind) {
    return `<button type="button" class="profile-icon-button" data-edit aria-label="Editar ${kind}">${ICON_EDIT}</button>`
      + `<button type="button" class="profile-icon-button" data-remove aria-label="Remover ${kind}">${ICON_REMOVE}</button>`;
  }

  function buildEntry(icon, className) {
    const entry = document.createElement("article");
    entry.className = className;
    const iconBox = document.createElement("span");
    iconBox.className = "profile-entry__icon";
    iconBox.innerHTML = icon;
    const content = document.createElement("div");
    content.className = "profile-entry__content";
    const actions = document.createElement("div");
    actions.className = "profile-entry__actions";
    entry.append(iconBox, content, actions);
    return { entry, content, actions };
  }

  function fillCertificate(entry, data) {
    Object.assign(entry.dataset, data);
    const content = entry.querySelector(".profile-entry__content");
    const title = document.createElement("strong");
    title.textContent = data.hours ? `${data.title} • ${data.hours}h` : data.title;
    content.replaceChildren(title);
    if (data.date) {
      const meta = document.createElement("p");
      meta.className = "profile-entry__meta";
      meta.textContent = `Emitido em ${dateLabel(data.date)}`;
      content.appendChild(meta);
    }
  }

  function fillExperience(entry, data) {
    Object.assign(entry.dataset, data);
    const content = entry.querySelector(".profile-entry__content");
    const title = document.createElement("strong");
    const meta = document.createElement("p");
    title.textContent = data.role;
    meta.className = "profile-entry__meta";
    meta.textContent = `${data.company} • ${monthLabel(data.start)} - ${data.end ? monthLabel(data.end) : "Atual"}`;
    content.replaceChildren(title, meta);
    if (data.desc) {
      const copy = document.createElement("p");
      copy.className = "profile-entry__description";
      copy.textContent = data.desc;
      content.appendChild(copy);
    }
  }

  function openCertificate(entry, trigger) {
    editing = entry || null;
    const form = byId("cert-form");
    clearForm(form);
    byId("modal-cert-title").textContent = entry ? "Editar certificado" : "Adicionar certificado";
    if (entry) {
      byId("cert-title").value = entry.dataset.title || "";
      byId("cert-hours").value = entry.dataset.hours || "";
      byId("cert-date").value = entry.dataset.date || "";
    }
    openDialog("modal-cert", trigger);
  }

  function saveCertificate() {
    const title = byId("cert-title");
    if (!validateRequired([title])) return;
    const data = { title: title.value.trim(), hours: byId("cert-hours").value.trim(), date: byId("cert-date").value };
    const wasEditing = Boolean(editing);
    if (editing) {
      fillCertificate(editing, data);
    } else {
      const { entry, actions } = buildEntry(ICON_CERT, "profile-entry");
      actions.innerHTML = actionsMarkup("certificado");
      fillCertificate(entry, data);
      byId("cert-list").appendChild(entry);
    }
    const target = editing;
    closeDialog({ restoreFocus: !target });
    if (target) target.querySelector("[data-edit]")?.focus();
    showToast(wasEditing ? "Certificado atualizado." : "Certificado adicionado.");
  }

  function openExperience(entry, trigger) {
    editing = entry || null;
    const form = byId("exp-form");
    clearForm(form);
    byId("modal-exp-title").textContent = entry ? "Editar experiência" : "Adicionar experiência";
    if (entry) {
      byId("exp-cargo").value = entry.dataset.role || "";
      byId("exp-empresa").value = entry.dataset.company || "";
      byId("exp-inicio").value = entry.dataset.start || "";
      byId("exp-fim").value = entry.dataset.end || "";
      byId("exp-atual").checked = !entry.dataset.end;
      byId("exp-desc").value = entry.dataset.desc || "";
    }
    syncCurrentJob();
    openDialog("modal-exp", trigger);
  }

  function syncCurrentJob() {
    const current = byId("exp-atual").checked;
    const end = byId("exp-fim");
    end.disabled = current;
    if (current) { end.value = ""; setFieldError(end, ""); }
  }

  function saveExperience() {
    const role = byId("exp-cargo");
    const company = byId("exp-empresa");
    const start = byId("exp-inicio");
    const end = byId("exp-fim");
    if (!validateRequired([role, company, start])) return;
    if (end.value && end.value < start.value) {
      setFieldError(end, "O fim não pode ser anterior ao início.");
      end.focus();
      return;
    }
    setFieldError(end, "");
    const data = { role: role.value.trim(), company: company.value.trim(), start: start.value, end: end.value, desc: byId("exp-desc").value.trim() };
    const wasEditing = Boolean(editing);
    if (editing) {
      fillExperience(editing, data);
    } else {
      const { entry, actions } = buildEntry(ICON_JOB, "profile-entry exp-item");
      actions.innerHTML = actionsMarkup("experiência");
      fillExperience(entry, data);
      byId("exp-list").appendChild(entry);
    }
    const target = editing;
    closeDialog({ restoreFocus: !target });
    if (target) target.querySelector("[data-edit]")?.focus();
    showToast(wasEditing ? "Experiência atualizada." : "Experiência adicionada.");
  }

  /* ---------- Idiomas ---------- */
  function openLanguage(trigger) {
    clearForm(byId("lang-form"));
    openDialog("modal-lang", trigger);
  }

  function saveLanguage() {
    const name = byId("lang-name");
    if (!validateRequired([name])) return;
    if ([...root.querySelectorAll("#lang-list .profile-language-title")].some((item) => item.textContent === name.value)) {
      setFieldError(name, "Este idioma já foi adicionado.");
      name.focus();
      return;
    }
    const level = byId("lang-form").querySelector('input[name="lang-level"]:checked').value;
    const levels = ["Não possuo", "Básico", "Intermediário", "Avançado", "Fluente"];
    const group = `language-level-${++languageCount}`;
    const block = document.createElement("div");
    const head = document.createElement("div");
    const title = document.createElement("p");
    const remove = document.createElement("button");
    const row = document.createElement("div");
    block.className = "profile-language";
    head.className = "profile-language__head";
    title.className = "profile-language-title";
    title.textContent = name.value;
    remove.type = "button";
    remove.className = "profile-icon-button";
    remove.dataset.remove = "";
    remove.setAttribute("aria-label", `Remover idioma ${name.value}`);
    remove.innerHTML = ICON_REMOVE;
    head.append(title, remove);
    row.className = "profile-choice-row";
    row.setAttribute("role", "radiogroup");
    row.setAttribute("aria-label", `Nível de ${name.value}`);
    levels.forEach((label) => {
      const choice = document.createElement("label");
      const input = document.createElement("input");
      const text = document.createElement("span");
      choice.className = "profile-choice";
      input.type = "radio";
      input.name = group;
      input.value = label;
      input.checked = label === level;
      text.textContent = label;
      choice.append(input, text);
      row.appendChild(choice);
    });
    block.append(head, row);
    byId("lang-list").appendChild(block);
    closeDialog();
    showToast("Idioma adicionado.");
  }

  /* ---------- Habilidades ---------- */
  function currentSkills() {
    return [...byId("skills-list").querySelectorAll(":scope > span")].map((item) => item.firstChild.textContent.trim());
  }

  function updateSkillsCounter() {
    const counter = root.querySelector(".profile-skills-counter");
    if (counter) counter.textContent = `${currentSkills().length}/${MAX_SKILLS}`;
  }

  function openSkills(trigger) {
    const modal = byId("modal-skills");
    const selected = new Set(currentSkills());
    modal.querySelectorAll('input[type="checkbox"]').forEach((box) => { box.checked = selected.has(box.value); });
    const error = byId("skills-error");
    error.hidden = true;
    openDialog("modal-skills", trigger);
  }

  function saveSkills() {
    const modal = byId("modal-skills");
    const chosen = [...modal.querySelectorAll('input[type="checkbox"]:checked')].map((box) => box.value);
    const error = byId("skills-error");
    if (chosen.length > MAX_SKILLS) {
      error.textContent = `Selecione no máximo ${MAX_SKILLS} competências (${chosen.length} marcadas).`;
      error.hidden = false;
      return;
    }
    const list = byId("skills-list");
    const catalog = new Set([...modal.querySelectorAll('input[type="checkbox"]')].map((box) => box.value));
    // Mantém competências fora do catálogo da modal e substitui as demais pela seleção.
    [...list.querySelectorAll(":scope > span")].forEach((item) => {
      if (catalog.has(item.firstChild.textContent.trim())) item.remove();
    });
    chosen.forEach((value) => {
      const skill = document.createElement("span");
      const remove = document.createElement("button");
      skill.className = "profile-skill-badge";
      skill.append(document.createTextNode(`${value} `));
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remover ${value}`);
      skill.appendChild(remove);
      list.appendChild(skill);
    });
    updateSkillsCounter();
    closeDialog();
    showToast("Habilidades atualizadas.");
  }

  /* ---------- Confirmação de remoção ---------- */
  function askRemoval(entry, label, trigger) {
    pendingRemoval = entry;
    byId("modal-confirm-title").textContent = `Remover ${label}?`;
    byId("confirm-text").textContent = "Essa ação não pode ser desfeita.";
    byId("confirm-ok").dataset.label = label;
    openDialog("modal-confirm", trigger);
    byId("confirm-ok").focus();
  }

  function confirmRemoval() {
    const entry = pendingRemoval;
    if (!entry) return;
    const label = byId("confirm-ok").dataset.label;
    const list = entry.parentElement;
    closeDialog({ restoreFocus: false });
    entry.remove();
    (list?.closest("section")?.querySelector("[data-open-dialog]") || root).focus?.();
    showToast(`${label.charAt(0).toUpperCase()}${label.slice(1)} removido.`);
  }

  /* ---------- Foto, currículo e vídeo ---------- */
  function previewAvatar(file) {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      byId("avatar-upload").value = "";
      showToast("Selecione uma imagem JPG ou PNG de até 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = document.createElement("img");
      image.src = reader.result;
      image.alt = "Foto de perfil de João Silva";
      byId("avatar-preview").replaceChildren(image);
      showToast("Foto atualizada.");
    });
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    byId("avatar-upload").value = "";
    byId("avatar-preview").replaceChildren(document.createTextNode("JS"));
    showToast("Foto removida.");
  }

  function showPdf(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      byId("pdf-input").value = "";
      showToast("Envie um arquivo PDF.");
      return;
    }
    byId("pdf-filename").textContent = file.name;
    byId("pdf-file").style.display = "inline-flex";
    byId("pdf-empty-label").style.display = "none";
    showToast("Currículo enviado.");
  }

  function clearPdf() {
    byId("pdf-input").value = "";
    byId("pdf-file").style.display = "none";
    byId("pdf-empty-label").style.display = "";
    showToast("Currículo removido.");
  }

  function updateVideoPreview() {
    const url = byId("video-url").value.trim();
    const preview = byId("video-preview");
    const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    const source = youtube ? `https://www.youtube.com/embed/${youtube[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : "";
    if (!source) {
      preview.style.display = "none";
      preview.replaceChildren();
      return;
    }
    preview.style.display = "none";
  }

  /* ---------- Pré-visualização (visão da empresa) ---------- */
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const PREVIEW_ICONS = {
    job: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 12h20"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    whatsapp: '<img src="../assets/admin-figma/RequestWhatsapp.svg" alt="">',
    email: '<img src="../assets/admin-figma/RequestEmail.svg" alt="">',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.9a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/></svg>'
  };
  let previewOrigin = null;

  function previewContact(label, icon, filled) {
    return filled ? `<button type="button" class="candidate-profile__contact" data-profile-contact="${label}">${icon}<span>${label}</span></button>` : "";
  }

  function renderPreview() {
    const name = byId("profile-name").value.trim();
    const city = byId("profile-city").value;
    const summary = root.querySelector(".profile-textarea").value.trim();
    const skills = [...byId("skills-list").querySelectorAll(":scope > span")].map((item) => item.firstChild.textContent.trim());
    const english = root.querySelector('input[name="english-level"]:checked')?.nextElementSibling.textContent || "";
    const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    const photo = byId("avatar-preview").querySelector("img");
    const section = (title, content) => (content ? `<section class="candidate-profile__section"><h3>${title}</h3>${content}</section>` : "");

    byId("candidate-profile-avatar").innerHTML = photo ? `<img src="${escapeHtml(photo.src)}" alt="">` : escapeHtml(initials);
    byId("candidate-profile-title").textContent = name;
    byId("candidate-profile-role").textContent = "Estudante SCTEC";
    byId("candidate-profile-meta").textContent = `${city}, SC${english ? `  •  Inglês ${english}` : ""}`;
    byId("candidate-profile-minor").hidden = true;
    byId("candidate-profile-contacts").innerHTML = previewContact("WhatsApp", PREVIEW_ICONS.whatsapp, byId("profile-phone").value.trim())
      + previewContact("LinkedIn", PREVIEW_ICONS.linkedin, byId("profile-linkedin").value.trim())
      + previewContact("E-mail", PREVIEW_ICONS.email, byId("profile-email").value.trim())
      + previewContact("GitHub", PREVIEW_ICONS.github, byId("profile-github").value.trim());

    const experiences = [...byId("exp-list").querySelectorAll(".profile-entry")].map((entry) => `<article class="candidate-profile__entry"><span class="candidate-profile__entry-icon">${PREVIEW_ICONS.job}</span><div class="candidate-profile__entry-content"><strong>${escapeHtml(entry.dataset.role)}</strong><span>${escapeHtml(entry.dataset.company)} • ${monthLabel(entry.dataset.start)} - ${entry.dataset.end ? monthLabel(entry.dataset.end) : "Atual"}</span>${entry.dataset.desc ? `<p>${escapeHtml(entry.dataset.desc)}</p>` : ""}</div></article>`).join("");
    const certificates = [...byId("cert-list").querySelectorAll(".profile-entry")].map((entry) => {
      const content = entry.querySelector(".profile-entry__content");
      const issuer = content.querySelector(".profile-skill-badge")?.textContent;
      return `<article class="candidate-profile__entry"><span class="candidate-profile__entry-icon">${PREVIEW_ICONS.award}</span><div class="candidate-profile__entry-content">${issuer ? `<span class="candidate-profile__issuer">${escapeHtml(issuer)}</span>` : ""}<strong>${escapeHtml(content.querySelector("strong").textContent)}</strong>${content.querySelector(".profile-entry__meta") ? `<span>${escapeHtml(content.querySelector(".profile-entry__meta").textContent)}</span>` : ""}</div></article>`;
    }).join("");
    const languages = [...byId("lang-list").querySelectorAll(".profile-language")].map((block) => {
      const level = block.querySelector("input:checked")?.value;
      const label = block.querySelector("input:checked")?.nextElementSibling.textContent;
      return level && level !== "none" ? `<span class="candidate-profile__language">${escapeHtml(block.querySelector(".profile-language-title").textContent)} • ${escapeHtml(label)}</span>` : "";
    }).join("");
    const hasVideo = /youtube.com|youtu.be|vimeo.com/.test(byId("video-url").value);
    byId("candidate-profile-body").innerHTML = section("Sobre", summary && `<p>${escapeHtml(summary)}</p>`)
      + section("Competências Técnicas", skills.length && `<div class="candidate-profile__skills">${skills.map((skill) => `<span class="candidate-profile__skill">${escapeHtml(skill)}</span>`).join("")}</div>`)
      + (hasVideo ? '<section class="candidate-profile__section"><h3>Vídeo de apresentação</h3><div class="candidate-profile__video"><img src="../assets/admin-figma/candidate-modal-raw-1.png" alt="Prévia do vídeo de apresentação"></div></section>' : "")
      + section("Experiência profissional", experiences && `<div class="candidate-profile__list">${experiences}</div>`)
      + section("Formações e Certificados", certificates && `<div class="candidate-profile__list">${certificates}</div>`)
      + section("Idiomas", languages && `<div class="candidate-profile__languages">${languages}</div>`);
  }

  function openPreview(trigger) {
    const dialog = byId("candidate-profile-dialog");
    previewOrigin = trigger;
    renderPreview();
    document.body.classList.add("modal-open");
    dialog.showModal();
    byId("candidate-profile-close").focus();
  }

  const previewDialog = byId("candidate-profile-dialog");
  byId("profile-preview-link")?.addEventListener("click", (event) => { event.preventDefault(); openPreview(event.currentTarget); });
  byId("candidate-profile-close")?.addEventListener("click", () => previewDialog.close());
  previewDialog?.addEventListener("click", (event) => { if (event.target === previewDialog) previewDialog.close(); });
  previewDialog?.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    previewOrigin?.focus();
    previewOrigin = null;
  });

  /* ---------- Ligações ---------- */
  byId("avatar-toggle")?.addEventListener("click", toggleAvatarMenu);
  root.querySelector(".profile-skill-trigger")?.addEventListener("click", (event) => openSkills(event.currentTarget));
  root.querySelector(".profile-photo-preview")?.addEventListener("click", () => byId("avatar-upload").click());
  root.querySelector(".profile-photo-card__actions .profile-button--primary")?.addEventListener("click", () => byId("avatar-upload").click());
  root.querySelectorAll(".profile-photo-card__actions .profile-button")[1]?.addEventListener("click", removeAvatar);
  byId("avatar-upload")?.addEventListener("change", (event) => previewAvatar(event.target.files?.[0]));
  byId("video-url")?.addEventListener("input", updateVideoPreview);
  if (byId("video-url")?.value) updateVideoPreview();

  root.querySelectorAll("[data-open-dialog]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.openDialog;
    if (id === "modal-cert") openCertificate(null, button);
    else if (id === "modal-exp") openExperience(null, button);
    else if (id === "modal-lang") openLanguage(button);
  }));

  byId("cert-save")?.addEventListener("click", saveCertificate);
  byId("exp-save")?.addEventListener("click", saveExperience);
  byId("lang-save")?.addEventListener("click", saveLanguage);
  byId("skills-save")?.addEventListener("click", saveSkills);
  byId("confirm-ok")?.addEventListener("click", confirmRemoval);
  byId("exp-atual")?.addEventListener("change", syncCurrentJob);
  ["cert-form", "exp-form", "lang-form"].forEach((id) => byId(id)?.addEventListener("submit", (event) => {
    event.preventDefault();
    byId(id.replace("-form", "-save")).click();
  }));
  byId("modal-skills")?.addEventListener("change", () => { byId("skills-error").hidden = true; });
  document.querySelectorAll("[data-close-dialog]").forEach((element) => element.addEventListener("click", () => closeDialog()));

  const dropzone = byId("pdf-dropzone");
  dropzone?.addEventListener("click", (event) => {
    if (event.target.closest(".dropzone__remove")) return;
    byId("pdf-input").click();
  });
  byId("pdf-input")?.addEventListener("change", (event) => showPdf(event.target.files?.[0]));
  dropzone?.querySelector(".dropzone__remove")?.addEventListener("click", (event) => { event.stopPropagation(); clearPdf(); });
  ["dragenter", "dragover"].forEach((type) => dropzone?.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.add("dropzone--over"); }));
  ["dragleave", "drop"].forEach((type) => dropzone?.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.remove("dropzone--over"); }));
  dropzone?.addEventListener("drop", (event) => showPdf(event.dataTransfer?.files?.[0]));

  byId("skills-list")?.addEventListener("click", (event) => {
    const remove = event.target.closest("button");
    if (!remove) return;
    remove.closest("span")?.remove();
    updateSkillsCounter();
  });

  root.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const remove = event.target.closest("[data-remove]");
    const entry = (edit || remove)?.closest(".profile-entry, .profile-language");
    if (!entry) return;
    const trigger = edit || remove;
    if (edit) {
      if (entry.closest("#cert-list")) openCertificate(entry, trigger);
      else openExperience(entry, trigger);
    } else if (entry.classList.contains("profile-language")) {
      askRemoval(entry, "idioma", trigger);
    } else if (entry.closest("#cert-list")) {
      askRemoval(entry, "certificado", trigger);
    } else {
      askRemoval(entry, "experiência", trigger);
    }
  });

  root.querySelector(".student-profile-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Perfil atualizado.");
  });

  document.addEventListener("click", (event) => {
    const menu = byId("avatar-menu");
    const toggle = byId("avatar-toggle");
    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
      menu.classList.remove("avatar-menu--open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!activeDialog) return;
    if (event.key === "Escape") { event.preventDefault(); closeDialog(); return; }
    if (event.key !== "Tab") return;
    const items = focusables(activeDialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === activeDialog.querySelector(".modal__content"))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  window.showToast = showToast;
})();
