/* ============================================
   SCTEC Prototype - Main JavaScript
   ============================================ */

/**
 * Component Loader
 * Carrega componentes HTML parciais (govbar, navbar, footer)
 * nos placeholders marcados com data-component="path/to/file.html"
 */
async function loadComponents() {
  const placeholders = document.querySelectorAll('[data-component]');
  
  for (const placeholder of placeholders) {
    const path = placeholder.getAttribute('data-component');
    try {
      const response = await fetch(path);
      if (response.ok) {
        const html = await response.text();
        placeholder.innerHTML = html;
      } else {
        console.warn(`[Component Loader] Falha ao carregar: ${path} (${response.status})`);
      }
    } catch (error) {
      console.warn(`[Component Loader] Erro ao carregar: ${path}`, error);
    }
  }

  // Após carregar componentes, inicializar interações
  initNavbar();
  initActiveLinks();
}

/**
 * Navbar - Mobile toggle e scroll behavior
 */
function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const links = document.getElementById('navbar-links');
  
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('navbar__links--open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // Fechar menu ao clicar em um link (mobile)
    links.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('navbar__links--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Navbar shrink on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 100) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }
}

/**
 * Active Link Highlighting
 * Marca o link ativo na navbar baseado na URL atual
 */
function initActiveLinks() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar__link');
  
  navLinks.forEach(link => {
    link.classList.remove('navbar__link--active');
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href.replace('/prototype', ''))) {
      link.classList.add('navbar__link--active');
    }
  });
}

/**
 * Smooth Scroll para anchors internas
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Form validation básica
 */
function initForms() {
  const form = document.getElementById('form-inscricao');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validação simples
      const requiredFields = form.querySelectorAll('[required], .form-group__input');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#E53935';
          isValid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (isValid) {
        alert('Cadastro realizado com sucesso! (Protótipo - sem backend)');
        form.reset();
      }
    });

    // Remove erro ao digitar
    form.querySelectorAll('.form-group__input').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    });
  }
}

/**
 * Scroll Reveal - Animações de entrada suaves
 */
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos que devem animar
  const animatedElements = document.querySelectorAll(
    '.carreira-card, .video-card, .lineup__step, .trilha-mini, .speaker-card, .duvidas__card'
  );
  
  animatedElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/**
 * Init tudo quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  initSmoothScroll();
  initForms();
  initScrollReveal();
});
