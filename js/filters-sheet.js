"use strict";

(() => {
  const sheet = document.getElementById("filters-sheet");
  const trigger = document.querySelector(".filters-trigger");
  if (!sheet || !trigger) return;
  const badge = trigger.querySelector(".filters-trigger__badge");
  const backdrop = document.createElement("div");
  backdrop.className = "filters-sheet__backdrop";
  sheet.after(backdrop);
  const close = sheet.querySelector(".filters-sheet__close");

  function setOpen(open) {
    sheet.classList.toggle("filters-sheet--open", open);
    backdrop.classList.toggle("filters-sheet__backdrop--open", open);
    document.body.classList.toggle("filters-sheet-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    if (open) close.focus(); else trigger.focus();
  }

  function updateBadge() {
    const count = document.querySelectorAll("#active-filters .student-companies__chip, #company-active-filters .company-search__chip").length;
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  trigger.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  sheet.querySelector(".filters-sheet__apply").addEventListener("click", () => setOpen(false));
  sheet.querySelector(".filters-sheet__clear").addEventListener("click", () => {
    document.querySelector("[data-clear-all], .student-companies__clear")?.click();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet.classList.contains("filters-sheet--open") && !document.querySelector(".company-filter__popover:not([hidden])")) setOpen(false);
  });
  window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
    if (!event.matches) return;
    sheet.classList.remove("filters-sheet--open");
    backdrop.classList.remove("filters-sheet__backdrop--open");
    document.body.classList.remove("filters-sheet-open");
  });
  document.querySelectorAll("#active-filters, #company-active-filters").forEach((container) => new MutationObserver(updateBadge).observe(container, { childList: true }));
  updateBadge();
})();
