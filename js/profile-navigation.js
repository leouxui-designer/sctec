"use strict";
(() => {
  const brand = document.querySelector(".navbar__brand");
  if (!brand) return;
  const sidebarLinks = [...document.querySelectorAll(".sidebar--admin .sidebar__link")];
  const first = (sidebarLinks.length ? sidebarLinks : [...document.querySelectorAll(".avatar-menu__link")])
    .find((link) => link.getAttribute("aria-disabled") !== "true" && !link.classList.contains("avatar-menu__link--logout"));
  if (!first) return;
  const target = first.getAttribute("href");
  if (!target || target === "#") return;
  brand.setAttribute("href", target);
  const routes = {
    "admin-empresas.html": "#/sctec/admin/companies",
    "admin-empresa-cadastro.html": "#/sctec/admin/company-create",
    "admin-empresa-editar.html": "#/sctec/admin/company-edit",
    "admin-alunos.html": "#/sctec/admin/students",
    "admin-aluno-cadastro.html": "#/sctec/admin/student-create",
    "admin-aluno-perfil.html": "#/sctec/admin/student-profile",
    "admin-usuarios.html": "#/sctec/admin/users",
    "admin-usuario-cadastro.html": "#/sctec/admin/user-create",
    "admin-tags.html": "#/sctec/admin/tags",
    "painel-candidatos.html": "#/sctec/company/candidates",
    "painel-perfil.html": "#/sctec/company/profile",
    "acate-empresas.html": "#/sctec/acate/companies",
    "acate-empresa-perfil.html": "#/sctec/acate/companies",
    "acate-empresa-editar.html": "#/sctec/acate/companies",
    "aluno-empresas.html": "#/sctec/student/companies",
    "aluno-perfil.html": "#/sctec/student/profile",
    "aluno-perfil-publico.html": "#/sctec/talent/public-profile",
    "empresa-perfil-publico.html": "#/sctec/student/company-profile",
  };

  const navigateThroughViewer = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.parent === window) return;
    const fileName = new URL(event.currentTarget.href, window.location.href).pathname.split("/").pop();
    const route = routes[fileName];
    if (!route) return;
    try {
      if (window.parent.location.origin !== window.location.origin || !window.parent.document.getElementById("sctec-content")) return;
      event.preventDefault();
      window.parent.location.hash = route;
    } catch { /* standalone navigation remains the normal fallback */ }
  };

  brand.addEventListener("click", navigateThroughViewer);
  document.querySelectorAll(".sidebar__link, .avatar-menu__link").forEach((link) => {
    if (!link.classList.contains("avatar-menu__link--logout")) link.addEventListener("click", navigateThroughViewer);
  });
})();
