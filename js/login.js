"use strict";

const profileModal = document.getElementById("modal-perfil");
const profileModalContent = profileModal?.querySelector(".modal__content");
const loginForm = document.getElementById("login-form");
let lastFocusedElement = null;

function closeProfileModal() {
  if (!profileModal) return;
  profileModal.classList.remove("modal--open");
  profileModal.setAttribute("aria-hidden", "true");
  if (lastFocusedElement) lastFocusedElement.focus();
}

function navigateInViewer(route) {
  if (window.parent !== window && window.parent.document.getElementById("sctec-content")) {
    window.parent.location.hash = route;
    return;
  }
  window.location.href = `../viewer.html${route}`;
}

function openProfileModal(event) {
  event.preventDefault();
  if (!profileModal || !profileModalContent) return;
  lastFocusedElement = document.activeElement;
  profileModal.classList.add("modal--open");
  profileModal.setAttribute("aria-hidden", "false");
  profileModalContent.focus();
}

loginForm?.addEventListener("submit", openProfileModal);

profileModal?.addEventListener("click", (event) => {
  const link = event.target.closest("[data-profile-route]");
  if (!link) return;
  event.preventDefault();
  closeProfileModal();
  navigateInViewer(link.dataset.profileRoute);
});

profileModal?.querySelector("[data-close-profile-modal]")?.addEventListener("click", closeProfileModal);

document.addEventListener("keydown", (event) => {
  if (!profileModal?.classList.contains("modal--open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeProfileModal();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [...profileModal.querySelectorAll(
    'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
