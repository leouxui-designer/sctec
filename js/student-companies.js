"use strict";

(() => {
  const root = document.querySelector(".student-companies-page");
  if (!root) return;

  const techSelecionadas = new Set();
  const byId = (id) => document.getElementById(id);
  const modal = byId("company-profile-modal");
  const modalDialog = modal?.querySelector(".student-company-modal__dialog");
  let modalOrigin = null;

  const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  function closeFilterSelects(except) {
    root.querySelectorAll(".student-select").forEach((wrapper) => {
      if (wrapper === except) return;
      wrapper.querySelector(".student-select__menu").hidden = true;
      wrapper.querySelector(".student-select__trigger").setAttribute("aria-expanded", "false");
    });
  }

  function syncFilterSelect(select) {
    const wrapper = select.closest(".student-select");
    if (!wrapper) return;
    const selected = select.options[select.selectedIndex] || select.options[0];
    wrapper.querySelector(".student-select__value").textContent = selected.textContent;
    wrapper.querySelectorAll(".student-select__option").forEach((option) => {
      option.setAttribute("aria-selected", String(option.dataset.value === selected.value));
    });
  }

  function enhanceFilterSelect(select) {
    if (select.closest(".student-select")) return;
    const wrapper = document.createElement("div");
    const trigger = document.createElement("button");
    const value = document.createElement("span");
    const chevron = document.createElement("img");
    const menu = document.createElement("div");
    const menuId = `${select.id}-options`;

    wrapper.className = "student-select";
    wrapper.dataset.selectId = select.id;
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add("student-select__native");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    trigger.type = "button";
    trigger.className = "student-select__trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menuId);
    trigger.setAttribute("aria-label", `Filtrar por ${select.options[0].textContent}`);
    value.className = "student-select__value";
    chevron.src = "../assets/admin-figma/TablerIconsChevronDown.svg";
    chevron.alt = "";
    chevron.width = 24;
    chevron.height = 24;
    trigger.append(value, chevron);

    menu.id = menuId;
    menu.className = "student-select__menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", select.options[0].textContent);
    menu.hidden = true;

    [...select.options].forEach((nativeOption) => {
      const option = document.createElement("button");
      const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const checkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const label = document.createElement("span");
      option.type = "button";
      option.className = "student-select__option";
      option.dataset.value = nativeOption.value;
      option.setAttribute("role", "option");
      check.setAttribute("viewBox", "0 0 24 24");
      check.setAttribute("aria-hidden", "true");
      checkPath.setAttribute("d", "m5 12 4 4L19 6");
      check.appendChild(checkPath);
      label.textContent = nativeOption.textContent;
      option.append(check, label);
      option.addEventListener("click", () => {
        select.value = nativeOption.value;
        syncFilterSelect(select);
        closeFilterSelects();
        trigger.focus();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      menu.appendChild(option);
    });

    wrapper.append(trigger, menu);
    syncFilterSelect(select);

    function openMenu() {
      closeFilterSelects(wrapper);
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      (menu.querySelector('[aria-selected="true"]') || menu.querySelector('[role="option"]'))?.focus();
    }

    function closeMenu({ restoreFocus = false } = {}) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    }

    trigger.addEventListener("click", () => {
      if (menu.hidden) openMenu();
      else closeMenu();
    });
    trigger.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
    });
    menu.addEventListener("keydown", (event) => {
      const options = [...menu.querySelectorAll('[role="option"]')];
      const index = options.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        options[(index + direction + options.length) % options.length].focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        options[event.key === "Home" ? 0 : options.length - 1].focus();
      }
    });
    wrapper.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) closeMenu();
      }, 0);
    });
    select.addEventListener("change", () => syncFilterSelect(select));
  }

  function createMetaIcon(path) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    path.forEach(({ tag = "path", attrs }) => {
      const element = document.createElementNS(namespace, tag);
      Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
      svg.appendChild(element);
    });
    return svg;
  }

  function enrichCompanyCards() {
    root.querySelectorAll("#empresas-grid .empresa-card").forEach((card) => {
      const segment = card.querySelector(".empresa-card__segmento");
      if (segment) segment.textContent = card.dataset.segmento || segment.textContent.split("·")[0].trim();
      if (card.querySelector(".empresa-card__meta")) return;

      const meta = document.createElement("div");
      meta.className = "empresa-card__meta";

      const city = document.createElement("span");
      city.className = "empresa-card__meta-item";
      city.append(
        createMetaIcon([
          { attrs: { d: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" } },
          { tag: "circle", attrs: { cx: "12", cy: "10", r: "3" } }
        ]),
        document.createTextNode(card.dataset.cidade || "Santa Catarina")
      );

      const separator = document.createElement("span");
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "•";

      const size = document.createElement("span");
      size.className = "empresa-card__meta-item";
      size.append(
        createMetaIcon([
          { attrs: { d: "M3 21h18" } },
          { attrs: { d: "M6 21V7l6-4v18" } },
          { attrs: { d: "M18 21V11l-6-4" } },
          { attrs: { d: "M9 9v.01" } },
          { attrs: { d: "M9 12v.01" } },
          { attrs: { d: "M9 15v.01" } },
          { attrs: { d: "M9 18v.01" } }
        ]),
        document.createTextNode(`Porte ${card.dataset.porte || "não informado"}`)
      );

      meta.append(city, separator, size);
      card.appendChild(meta);
    });
  }

  function closeCompanyModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalOrigin?.isConnected) modalOrigin.focus();
    modalOrigin = null;
  }

  function openCompanyModal(card) {
    if (!modal || !modalDialog) return;
    const name = card.dataset.nome || "Empresa";
    const segment = card.dataset.segmento || "Tecnologia";
    const city = card.dataset.cidade || "Santa Catarina";
    const size = card.dataset.porte || "Não informado";
    const description = card.querySelector(".empresa-card__desc")?.textContent.trim() || "Conheça a empresa e suas oportunidades.";
    const skills = (card.dataset.tech || "").split(",").map((item) => item.trim()).filter(Boolean);
    const slug = slugify(name.replace(/\b(ltda|solucoes|tecnologia)\b/gi, "").trim()) || "empresa";
    const siteUrl = `https://${slug}.com.br`;
    const careersUrl = `${siteUrl}/carreiras`;
    const jobsUrl = `https://${slug}.gupy.io`;

    byId("company-modal-name").textContent = name;
    byId("company-modal-segment").textContent = segment;
    byId("company-modal-city").textContent = `${city}, SC`;
    byId("company-modal-size").textContent = `Porte ${size}`;
    byId("company-modal-description").textContent = description;

    const skillsContainer = byId("company-modal-skills");
    skillsContainer.replaceChildren(...skills.map((skill) => {
      const badge = document.createElement("span");
      badge.textContent = skill;
      return badge;
    }));

    const links = {
      "company-modal-linkedin": `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(name)}`,
      "company-modal-instagram": `https://www.instagram.com/${slug}`,
      "company-modal-site": siteUrl,
      "company-modal-careers": careersUrl,
      "company-modal-jobs": jobsUrl
    };
    Object.entries(links).forEach(([id, href]) => { byId(id).href = href; });
    byId("company-modal-careers-url").textContent = careersUrl;
    byId("company-modal-jobs-url").textContent = jobsUrl;

    modalOrigin = card;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalDialog.focus();
  }

  const FILTER_IDS = ["filtro-segmento", "filtro-competencia", "filtro-regiao", "filtro-cidade"];

  function renderChips(texto) {
    const wrapper = byId("active-filters");
    if (!wrapper) return;
    wrapper.replaceChildren();
    const addChip = (label, remove) => {
      const chip = document.createElement("span");
      const button = document.createElement("button");
      chip.className = "student-companies__chip";
      chip.append(document.createTextNode(label));
      button.type = "button";
      button.textContent = "×";
      button.setAttribute("aria-label", `Remover filtro ${label}`);
      button.addEventListener("click", () => { remove(); filtrarEmpresas(); });
      chip.appendChild(button);
      wrapper.appendChild(chip);
    };
    FILTER_IDS.forEach((id) => {
      const select = byId(id);
      if (!select?.value) return;
      addChip(select.value, () => { select.value = ""; syncFilterSelect(select); });
    });
    techSelecionadas.forEach((tech) => addChip(tech, () => {
      techSelecionadas.delete(tech);
      root.querySelector(`#tech-chips .chip[data-tech="${tech}"]`)?.classList.remove("chip--active");
    }));
    if (wrapper.children.length || texto) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "student-companies__clear";
      clear.textContent = "Limpar todos";
      clear.addEventListener("click", () => { limparFiltros(); byId("busca-texto")?.focus(); });
      wrapper.appendChild(clear);
    }
    wrapper.hidden = !wrapper.children.length;
  }

  function filtrarEmpresas() {
    const texto = (byId("busca-texto")?.value || "").trim().toLowerCase();
    const segmento = byId("filtro-segmento")?.value || "";
    const competencia = byId("filtro-competencia")?.value || "";
    const regiao = byId("filtro-regiao")?.value || "";
    const cidade = byId("filtro-cidade")?.value || "";
    const cards = [...root.querySelectorAll("#empresas-grid .empresa-card")];
    let visiveis = 0;

    cards.forEach((card) => {
      const nome = (card.dataset.nome || "").toLowerCase();
      const cardTech = (card.dataset.tech || "").toLowerCase();
      const mostrar =
        (!texto || nome.includes(texto) || cardTech.includes(texto)) &&
        (!segmento || card.dataset.segmento === segmento) &&
        (!competencia || cardTech.includes(competencia.toLowerCase())) &&
        (!regiao || card.dataset.regiao === regiao) &&
        (!cidade || card.dataset.cidade === cidade) &&
        (techSelecionadas.size === 0 || [...techSelecionadas].every((tech) => cardTech.includes(tech.toLowerCase())));
      card.style.display = mostrar ? "" : "none";
      if (mostrar) visiveis += 1;
    });

    renderChips(texto);
    const count = byId("results-count");
    const empty = byId("empty-state");
    const grid = byId("empresas-grid");
    if (count) count.textContent = String(visiveis);
    if (empty) empty.style.display = visiveis === 0 ? "flex" : "none";
    if (grid) grid.style.display = visiveis === 0 ? "none" : "";
  }

  function limparFiltros() {
    ["busca-texto", "filtro-segmento", "filtro-competencia", "filtro-regiao", "filtro-cidade"].forEach((id) => {
      const element = byId(id);
      if (element) {
        element.value = "";
        if (element.matches("select")) syncFilterSelect(element);
      }
    });
    techSelecionadas.clear();
    root.querySelectorAll("#tech-chips .chip").forEach((chip) => chip.classList.remove("chip--active"));
    filtrarEmpresas();
  }

  function toggleTech(button) {
    const tech = button.dataset.tech;
    if (techSelecionadas.has(tech)) {
      techSelecionadas.delete(tech);
      button.classList.remove("chip--active");
    } else {
      techSelecionadas.add(tech);
      button.classList.add("chip--active");
    }
    filtrarEmpresas();
  }

  function toggleAvatarMenu() {
    const menu = byId("avatar-menu");
    const toggle = byId("avatar-toggle");
    if (!menu || !toggle) return;
    const open = !menu.classList.contains("avatar-menu--open");
    menu.classList.toggle("avatar-menu--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  root.querySelectorAll(".painel-filter__select").forEach(enhanceFilterSelect);
  root.querySelectorAll("#busca-texto, .painel-filter__select").forEach((control) => {
    control.addEventListener(control.matches("select") ? "change" : "input", filtrarEmpresas);
  });
  root.querySelectorAll("#tech-chips .chip").forEach((chip) => chip.addEventListener("click", () => toggleTech(chip)));
  root.querySelectorAll(".empresa-card").forEach((card) => {
    const showProfile = (event) => {
      if (event.target.closest("a, button")) return;
      event.preventDefault();
      openCompanyModal(card);
    };
    card.addEventListener("click", showProfile);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showProfile(event); }
    });
  });

  modal?.querySelectorAll("[data-company-modal-close]").forEach((control) => control.addEventListener("click", closeCompanyModal));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal || event.target.classList.contains("student-company-modal__backdrop")) closeCompanyModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modal || modal.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closeCompanyModal(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...modalDialog.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  byId("avatar-toggle")?.addEventListener("click", toggleAvatarMenu);
  byId("avatar-toggle")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleAvatarMenu(); }
  });
  byId("limpar-filtros")?.addEventListener("click", limparFiltros);
  document.addEventListener("click", (event) => {
    const menu = byId("avatar-menu");
    const toggle = byId("avatar-toggle");
    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
      menu.classList.remove("avatar-menu--open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (!event.target.closest(".student-select")) closeFilterSelects();
  });

  window.filtrarEmpresas = filtrarEmpresas;
  window.limparFiltros = limparFiltros;
  window.toggleTech = toggleTech;
  window.toggleAvatarMenu = toggleAvatarMenu;
  enrichCompanyCards();
  filtrarEmpresas();
})();
