"use strict";
(() => {
  const toggle = document.getElementById("avatar-toggle");
  const menu = document.getElementById("avatar-menu");
  if (!toggle || !menu) return;

  function setOpen(open, restoreFocus = false) {
    menu.hidden = !open;
    menu.classList.toggle("avatar-menu--open", open);
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    if (!open && restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", event => {
    event.stopPropagation();
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", event => {
    if (!menu.contains(event.target) && event.target !== toggle) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
  });
  setOpen(false);
})();
