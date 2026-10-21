"use strict";
(() => {
  const brand = document.querySelector('.company-header__brand');
  const toggle = document.getElementById('avatar-toggle');
  const menu = document.getElementById('avatar-menu');
  if (brand) brand.setAttribute('href', 'painel-candidatos.html');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('avatar-menu--open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!menu.classList.contains('avatar-menu--open'));
  });
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && event.target !== toggle) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('avatar-menu--open')) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
