"use strict";
// Shared administrator shell. Existing page content and navigation destinations stay intact.
(() => {
  const navbar = document.querySelector('.navbar--admin');
  if (!navbar) return;
  const toggle = navbar.querySelector('#avatar-toggle');
  const menu = navbar.querySelector('#avatar-menu');
  const close = () => { if (!menu || !toggle) return; menu.hidden = true; menu.classList.remove('avatar-menu--open'); toggle.setAttribute('aria-expanded', 'false'); };
  const routes = {"admin-alunos.html":"students","admin-aluno-perfil.html":"student-profile","admin-aluno-cadastro.html":"student-create","admin-empresas.html":"companies","admin-empresa-cadastro.html":"company-create","admin-empresa-editar.html":"company-edit","admin-usuarios.html":"users","admin-usuario-cadastro.html":"user-create","admin-tags.html":"tags","login.html":"LOGIN"};
  const unavailableTags = document.querySelector('.admin-tags-unavailable');
  if (unavailableTags) {
    const tagsLink = document.createElement('a');
    tagsLink.href = 'admin-tags.html';
    tagsLink.className = 'sidebar__link';
    tagsLink.append(...unavailableTags.childNodes);
    unavailableTags.replaceWith(tagsLink);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target) return;
    const route = routes[link.getAttribute('href')];
    if (!route || window.parent === window) return;
    try { if (window.parent.location.origin !== window.location.origin || !window.parent.document.getElementById('sctec-content')) return; } catch { return; }
    event.preventDefault();
    window.parent.location.hash = route === 'LOGIN' ? '#/sctec/talent-login' : '#/sctec/admin/' + route;
  });
  close();
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; menu.hidden = !open; menu.classList.toggle('avatar-menu--open', open); toggle.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', e => { if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
  document.querySelectorAll('.sidebar--admin a.sidebar__link').forEach(link => {
    const icon = link.getAttribute('href') === 'admin-empresas.html' ? 'LucideIconsBuilding' : link.getAttribute('href') === 'admin-alunos.html' ? 'LucideIconsUsersRound' : 'LucideIconsLockKeyhole';
    const svg = link.querySelector('svg');
    if (svg) { const img = document.createElement('img'); img.src = '../assets/admin-figma/' + icon + '.svg'; img.alt = ''; img.width = 24; img.height = 24; svg.replaceWith(img); }
  });
})();
