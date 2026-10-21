(function () {
  'use strict';

  const REGION = {
    GRANDE_FLORIPA: 'Florianópolis / Grande Florianópolis',
    VALE: 'Vale do Itajaí — Blumenau / Gaspar / Brusque',
    NORTE: 'Norte Catarinense — Joinville / Jaraguá do Sul',
    OESTE: 'Oeste de SC — Chapecó / Caçador',
    SUL: 'Sul de SC — Criciúma / Tubarão / Araranguá',
    SERRA: 'Serra — Lages / São Joaquim'
  };

  const options = {
    tracks: ['Desenvolvimento de Software', 'Análise de Dados', 'Inteligência Artificial'],
    skills: [
      'Agentes de IA', 'Angular', 'APIs REST', 'AWS', 'Azure', 'Bancos de Dados', 'C#',
      'Cibersegurança', 'CI/CD', 'Cloud Computing', 'CSS', 'Cypress', 'Data/Looker Studio',
      'DAX', 'Deep Learning', 'DevOps', 'ETL/ELT', 'Figma', 'Flutter', 'Git e GitHub',
      'Google Cloud', 'HTML', 'IA Generativa', 'Java', 'JavaScript', 'Jest', 'Kotlin',
      'LLMs', 'Machine Learning', 'Modelagem de Dados', 'Next.js', 'Node.js', '.Net',
      'NumPy', 'OpenCV', 'Pandas', 'Power BI', 'Power Query', 'Prompt Engineering',
      'Python', 'RAG', 'React', 'React Native', 'Scikit-learn', 'SQL', 'Tableau',
      'Terraform', 'Testes (Automatizados, API, Integração, E2E, Unitários)',
      'TypeScript', 'UX/UI Design', 'Visualização de Dados', 'Visão Computacional',
      'Web Scraping'
    ],
    regions: Object.values(REGION),
    cities: ['Florianópolis', 'Timbó', 'São Bento do Sul', 'Concórdia', 'Laguna', 'Urubici'],
    english: ['Básico', 'Intermediário', 'Avançado', 'Fluente']
  };

  const candidates = [
    {
      id: 1, name: 'João Silva', initials: 'JS', avatar: '../assets/admin-figma/candidate-modal-raw-2.jpeg', minor: true, presentation: true,
      tracks: ['Desenvolvimento de Software', 'Análise de Dados', 'Inteligência Artificial'],
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Azure', 'SQL', 'React'],
      city: 'Florianópolis', region: REGION.GRANDE_FLORIPA, english: 'Básico', pcd: false,
      summary: 'Desenvolvedor com interesse em soluções web, dados e inteligência artificial, focado em produtos simples e acessíveis.'
    },
    {
      id: 2, name: 'Anderson Cardoso Lima', initials: 'AL', avatar: '../assets/admin-figma/candidate-modal-raw-4.jpeg', presentation: true,
      tracks: ['Desenvolvimento de Software'], skills: ['React', 'Angular', 'Vue.js', 'PostgreSQL', 'TypeScript', 'Node.js', 'CSS'],
      city: 'Florianópolis', region: REGION.GRANDE_FLORIPA, english: 'Básico', pcd: false,
      summary: 'Desenvolvedor front-end com experiência em interfaces responsivas e integração com APIs.'
    },
    {
      id: 3, name: 'Alice Silveira Santos', initials: 'AS',
      tracks: ['Desenvolvimento de Software'], skills: ['Java', 'PostgreSQL', 'APIs REST', 'Git e GitHub', 'HTML', 'CSS'],
      city: 'Laguna', region: REGION.SUL, english: 'Básico', pcd: true,
      summary: 'Desenvolvedora em formação, interessada em aplicações web e boas práticas de engenharia de software.'
    },
    {
      id: 4, name: 'Diana Santos', initials: 'DS',
      tracks: ['Análise de Dados'], skills: ['Python', 'PostgreSQL', 'Pandas', 'Power BI', 'SQL', 'Visualização de Dados'],
      city: 'Urubici', region: REGION.SERRA, english: 'Intermediário', pcd: false,
      summary: 'Analista de dados com foco em transformar informações em indicadores claros para apoiar decisões.'
    },
    {
      id: 5, name: 'Eduardo Costa', initials: 'EC', presentation: true,
      tracks: ['Inteligência Artificial'], skills: ['Machine Learning', 'PostgreSQL', 'Python', 'Deep Learning', 'RAG', 'LLMs'],
      city: 'Florianópolis', region: REGION.GRANDE_FLORIPA, english: 'Avançado', pcd: false,
      summary: 'Profissional interessado em modelos preditivos, IA generativa e aplicações práticas de aprendizado de máquina.'
    },
    {
      id: 6, name: 'Gabriel Silva', initials: 'GS',
      tracks: ['Desenvolvimento de Software'], skills: ['PostgreSQL', 'JavaScript', 'Node.js', 'APIs REST', 'Git e GitHub', 'Azure'],
      city: 'São Bento do Sul', region: REGION.NORTE, english: 'Básico', pcd: false,
      summary: 'Desenvolvedor back-end com interesse em serviços web, bancos de dados e ambientes em nuvem.'
    },
    {
      id: 7, name: 'Helena Pereira', initials: 'HP', minor: true,
      tracks: ['Desenvolvimento de Software'], skills: ['Java', 'JSF', 'PostgreSQL', 'HTML', 'CSS', 'Testes (Automatizados, API, Integração, E2E, Unitários)'],
      city: 'Timbó', region: REGION.VALE, english: 'Intermediário', pcd: true,
      summary: 'Desenvolvedora com base em Java e interesse em qualidade de software e experiências inclusivas.'
    },
    {
      id: 8, name: 'Lucas Silva', initials: 'LS',
      tracks: ['Desenvolvimento de Software'], skills: ['Java', 'PostgreSQL', 'Spring Boot', 'APIs REST', 'Docker', 'AWS'],
      city: 'Concórdia', region: REGION.OESTE, english: 'Básico', pcd: false,
      summary: 'Desenvolvedor com foco em APIs, aplicações corporativas e integração de serviços.'
    },
    {
      id: 9, name: 'Mariana Costa', initials: 'MC', minor: true,
      tracks: ['Desenvolvimento de Software'], skills: ['Flutter', 'PostgreSQL', 'Dart', 'Git e GitHub', 'Figma', 'APIs REST'],
      city: 'Florianópolis', region: REGION.GRANDE_FLORIPA, english: 'Fluente', pcd: false,
      summary: 'Desenvolvedora mobile interessada em produtos digitais, prototipação e experiências consistentes.'
    },
    {
      id: 10, name: 'Rafael Gomes', initials: 'RG',
      tracks: ['Desenvolvimento de Software'], skills: ['Java', 'Spring Boot', 'JSF', 'PostgreSQL', 'Azure', 'SQL', 'React'],
      city: 'Florianópolis', region: REGION.GRANDE_FLORIPA, english: 'Avançado', pcd: true,
      summary: 'Desenvolvedor full-stack com experiência em aplicações Java, bancos relacionais e interfaces web.'
    }
  ];

  const state = {
    query: '', pcd: false, page: 1, pageSize: 5, sort: 'relevance', modalOrigin: null,
    selected: {
      tracks: new Set(), skills: new Set(), regions: new Set(), cities: new Set(), english: new Set()
    }
  };

  const mainSearchInput = document.getElementById('company-talent-search');
  const mainSearchClear = document.getElementById('company-talent-search-clear');
  function syncMainSearchClear() {
    mainSearchClear.hidden = mainSearchInput.value.length === 0;
  }

  const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

  function getPanel(key) {
    return document.querySelector('[data-filter-panel="' + key + '"]');
  }

  function closeFilters(exceptKey) {
    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
      if (panel.dataset.filterPanel === exceptKey) return;
      panel.hidden = true;
      const trigger = panel.closest('.company-filter').querySelector('.company-filter__trigger');
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  const sortTrigger = document.getElementById('company-sort-trigger');
  const sortMenu = document.getElementById('company-sort-menu');
  const sortLabels = {
    relevance: 'Mais relevantes',
    'name-asc': 'Nome (A–Z)',
    'name-desc': 'Nome (Z–A)'
  };

  function closeSort(restoreFocus) {
    if (!sortMenu || sortMenu.hidden) return;
    sortMenu.hidden = true;
    sortTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) sortTrigger.focus();
  }

  function openSort() {
    closeFilters();
    sortMenu.hidden = false;
    sortTrigger.setAttribute('aria-expanded', 'true');
    const selected = sortMenu.querySelector('[aria-checked="true"]');
    (selected || sortMenu.querySelector('[role="menuitemradio"]')).focus();
  }

  function selectSort(value) {
    if (!sortLabels[value]) return;
    state.sort = value;
    state.page = 1;
    document.getElementById('company-sort-label').textContent = sortLabels[value];
    sortMenu.querySelectorAll('[data-sort]').forEach((option) => option.setAttribute('aria-checked', String(option.dataset.sort === value)));
    closeSort(true);
    render();
  }

  function renderFilterOptions(key, searchTerm) {
    const panel = getPanel(key);
    if (!panel) return;
    const list = panel.querySelector('.company-filter__options');
    const term = normalize(searchTerm);
    const visibleOptions = options[key].filter((option) => normalize(option).includes(term));
    list.innerHTML = visibleOptions.map((option) => {
      const checked = state.selected[key].has(option);
      return '<label class="company-filter__option"><input type="checkbox" data-filter-option="' + key + '" value="' + escapeHtml(option) + '"' + (checked ? ' checked' : '') + '><span>' + escapeHtml(option) + '</span></label>';
    }).join('');
    panel.querySelector('[data-clear-filter]').disabled = state.selected[key].size === 0;
  }

  function getFilteredCandidates() {
    const query = normalize(state.query);
    const filtered = candidates.filter((candidate) => {
      const searchable = [candidate.name, candidate.city, candidate.region].concat(candidate.tracks, candidate.skills).join(' ');
      const queryMatch = !query || normalize(searchable).includes(query);
      const matchesAny = (key, values) => state.selected[key].size === 0 || values.some((value) => state.selected[key].has(value));
      const skillMatch = state.selected.skills.size === 0 || Array.from(state.selected.skills).every((skill) => candidate.skills.includes(skill));
      return queryMatch
        && matchesAny('tracks', candidate.tracks)
        && skillMatch
        && matchesAny('regions', [candidate.region])
        && matchesAny('cities', [candidate.city])
        && matchesAny('english', [candidate.english])
        && (!state.pcd || candidate.pcd);
    });
    if (state.sort === 'name-asc') return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
    if (state.sort === 'name-desc') return filtered.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' }));
    return filtered;
  }

  function candidateCard(candidate) {
    const titleBadges = [
      candidate.minor ? '<span class="company-candidate__badge company-candidate__badge--minor">Menor</span>' : '',
      candidate.presentation ? '<span class="company-candidate__badge company-candidate__badge--presentation">Vídeo de apresentação</span>' : ''
    ].join('');
    const skills = candidate.skills.slice(0, 4).map((skill) => '<span class="company-candidate__badge">' + escapeHtml(skill) + '</span>').join('');
    const extraSkills = candidate.skills.length > 4 ? '<span class="company-candidate__badge">+' + (candidate.skills.length - 4) + '</span>' : '';
    const avatarMarkup = candidate.avatar ? '<img src="' + escapeHtml(candidate.avatar) + '" alt="">' : escapeHtml(candidate.initials);
    return '<button class="company-candidate" type="button" data-candidate-id="' + candidate.id + '" aria-label="Ver perfil de ' + escapeHtml(candidate.name) + '">'
      + '<span class="company-candidate__avatar" aria-hidden="true">' + avatarMarkup + '</span>'
      + '<span class="company-candidate__body">'
      + '<span class="company-candidate__title"><h2>' + escapeHtml(candidate.name) + '</h2>' + titleBadges + '</span>'
      + '<span class="company-candidate__track">' + candidate.tracks.map(escapeHtml).join(' · ') + '</span>'
      + '<span class="company-candidate__badges">' + skills + extraSkills + '</span>'
      + '<span class="company-candidate__summary">' + escapeHtml(candidate.summary) + '</span>'
      + '<span class="company-candidate__meta"><span>' + escapeHtml(candidate.city) + '</span><span class="company-candidate__dot" aria-hidden="true">•</span><span>Inglês ' + escapeHtml(candidate.english) + '</span>' + (candidate.pcd ? '<span class="company-candidate__dot" aria-hidden="true">•</span><span>Pessoa com deficiência</span>' : '') + '</span>'
      + '</span></button>';
  }

  const dialog = document.getElementById('candidate-profile-dialog');
  const profileCompanies = ['Nuvem Sul', 'Estúdio Açoriano', 'Laboratório Digital SC', 'Horizonte Dados', 'Ilha Tech'];
  const roleByTrack = {
    'Desenvolvimento de Software': 'Desenvolvedor de Software',
    'Análise de Dados': 'Analista de Dados',
    'Inteligência Artificial': 'Especialista em Inteligência Artificial'
  };

  function showLocalToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast--visible');
    window.setTimeout(() => toast.classList.remove('toast--visible'), 2500);
  }

  function candidateProfile(candidate) {
    const role = roleByTrack[candidate.tracks[0]] || 'Profissional de Tecnologia';
    const company = profileCompanies[(candidate.id - 1) % profileCompanies.length];
    const previousCompany = profileCompanies[(candidate.id + 1) % profileCompanies.length];
    const skill = candidate.skills[0];
    return {
      role,
      about: candidate.summary + ' Valoriza colaboração, aprendizado contínuo e a criação de soluções digitais úteis para diferentes pessoas.',
      experiences: [
        { title: role, company, period: 'Mar 2026 - Atual', description: 'Atuação em projetos demonstrativos com ' + candidate.skills.slice(0, 3).join(', ') + ', revisão de entregas e colaboração com a equipe.' },
        { title: 'Assistente de Tecnologia', company: previousCompany, period: 'Jan 2025 - Fev 2026', description: 'Apoio no desenvolvimento de interfaces, documentação técnica e melhoria contínua de produtos digitais.' }
      ],
      certificates: [
        { issuer: 'SCTEC', title: candidate.tracks[0] + ' • 80h', date: 'Emitido em 10/08/2026' },
        { issuer: 'SCTEC', title: skill + ' Aplicado • 16h', date: 'Emitido em 12/04/2026' }
      ]
    };
  }

  const briefcaseIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 12h20"/></svg>';
  const awardIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';

  function contactButton(label, icon) {
    return '<button type="button" class="candidate-profile__contact" data-profile-contact="' + escapeHtml(label) + '">' + icon + '<span>' + escapeHtml(label) + '</span></button>';
  }

  function renderProfile(candidate) {
    const profile = candidateProfile(candidate);
    const avatar = document.getElementById('candidate-profile-avatar');
    avatar.innerHTML = candidate.avatar ? '<img src="' + escapeHtml(candidate.avatar) + '" alt="">' : escapeHtml(candidate.initials);
    document.getElementById('candidate-profile-title').textContent = candidate.name;
    document.getElementById('candidate-profile-role').textContent = profile.role;
    document.getElementById('candidate-profile-meta').textContent = candidate.city + ', SC  •  Inglês ' + candidate.english;
    document.getElementById('candidate-profile-minor').hidden = !candidate.minor;
    const whatsappIcon = '<img src="../assets/admin-figma/RequestWhatsapp.svg" alt="">';
    const emailIcon = '<img src="../assets/admin-figma/RequestEmail.svg" alt="">';
    const linkedinIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>';
    const githubIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.9a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/></svg>';
    document.getElementById('candidate-profile-contacts').innerHTML = contactButton('WhatsApp', whatsappIcon) + contactButton('LinkedIn', linkedinIcon) + contactButton('E-mail', emailIcon) + contactButton('GitHub', githubIcon);

    const skills = candidate.skills.map((skillName) => '<span class="candidate-profile__skill">' + escapeHtml(skillName) + '</span>').join('');
    const video = candidate.presentation ? '<section class="candidate-profile__section"><h3>Vídeo de apresentação</h3><div class="candidate-profile__video"><img src="../assets/admin-figma/candidate-modal-raw-1.png" srcset="../assets/admin-figma/candidate-modal-raw-3.png 660w, ../assets/admin-figma/candidate-modal-raw-1.png 1296w" sizes="(max-width: 768px) calc(100vw - 56px), 648px" alt="Prévia do vídeo de apresentação de ' + escapeHtml(candidate.name) + '"><button type="button" class="candidate-profile__play" data-profile-video aria-label="Reproduzir vídeo de apresentação"></button></div></section>' : '';
    const experiences = profile.experiences.map((entry) => '<article class="candidate-profile__entry"><span class="candidate-profile__entry-icon">' + briefcaseIcon + '</span><div class="candidate-profile__entry-content"><strong>' + escapeHtml(entry.title) + '</strong><span>' + escapeHtml(entry.company) + ' • ' + escapeHtml(entry.period) + '</span><p>' + escapeHtml(entry.description) + '</p></div></article>').join('');
    const certificates = profile.certificates.map((entry) => '<article class="candidate-profile__entry"><span class="candidate-profile__entry-icon">' + awardIcon + '</span><div class="candidate-profile__entry-content"><span class="candidate-profile__issuer">' + escapeHtml(entry.issuer) + '</span><strong>' + escapeHtml(entry.title) + '</strong><span>' + escapeHtml(entry.date) + '</span></div></article>').join('');
    document.getElementById('candidate-profile-body').innerHTML = '<section class="candidate-profile__section"><h3>Sobre</h3><p>' + escapeHtml(profile.about) + '</p></section>'
      + '<section class="candidate-profile__section"><h3>Competências Técnicas</h3><div class="candidate-profile__skills">' + skills + '</div></section>'
      + video
      + '<section class="candidate-profile__section"><h3>Experiência profissional</h3><div class="candidate-profile__list">' + experiences + '</div></section>'
      + '<section class="candidate-profile__section"><h3>Formações e Certificados</h3><div class="candidate-profile__list">' + certificates + '</div></section>'
      + '<section class="candidate-profile__section"><h3>Idiomas</h3><div class="candidate-profile__languages"><span class="candidate-profile__language">Inglês • ' + escapeHtml(candidate.english) + '</span></div></section>';
  }

  function openProfile(candidateId, origin) {
    const candidate = candidates.find((item) => item.id === Number(candidateId));
    if (!candidate) return;
    state.modalOrigin = origin;
    closeFilters();
    closeSort();
    renderProfile(candidate);
    document.body.classList.add('candidate-profile-open');
    dialog.showModal();
    document.getElementById('candidate-profile-close').focus();
  }

  function closeProfile() {
    if (dialog.open) dialog.close();
  }

  function hasActiveFilters() {
    return Boolean(state.query || state.pcd || Object.values(state.selected).some((selection) => selection.size));
  }

  function removeFilter(key, value) {
    state.selected[key].delete(value);
    state.page = 1;
    renderFilterOptions(key, '');
    render();
  }

  function renderChips() {
    const wrapper = document.getElementById('company-active-filters');
    const chips = [];
    Object.entries(state.selected).forEach(([key, selected]) => {
      selected.forEach((value) => {
        chips.push('<span class="company-search__chip">' + escapeHtml(value) + '<button type="button" data-remove-filter="' + key + '" data-filter-value="' + escapeHtml(value) + '" aria-label="Remover filtro ' + escapeHtml(value) + '">×</button></span>');
      });
    });
    if (state.pcd) chips.push('<span class="company-search__chip">Apenas PcD<button type="button" data-remove-pcd aria-label="Remover filtro Apenas PcD">×</button></span>');
    if (hasActiveFilters()) chips.push('<button class="company-search__clear-all" type="button" data-clear-all>Limpar todos</button>');
    wrapper.innerHTML = chips.join('');
    wrapper.hidden = !chips.length;
  }

  function renderPagination(total) {
    const pagination = document.getElementById('company-talent-pagination');
    const totalPages = Math.ceil(total / state.pageSize);
    if (totalPages <= 1) {
      pagination.hidden = true;
      pagination.innerHTML = '';
      return;
    }
    pagination.hidden = false;
    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return '<button type="button" data-page="' + page + '"' + (page === state.page ? ' aria-current="page"' : '') + ' aria-label="Página ' + page + '">' + page + '</button>';
    }).join('');
    pagination.innerHTML = '<button type="button" data-page="' + (state.page - 1) + '" aria-label="Página anterior"' + (state.page === 1 ? ' disabled' : '') + '>‹</button>'
      + pageButtons + '<span>de ' + totalPages + '</span>'
      + '<button type="button" data-page="' + (state.page + 1) + '" aria-label="Próxima página"' + (state.page === totalPages ? ' disabled' : '') + '>›</button>';
  }

  function render() {
    const filtered = getFilteredCandidates();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pageCandidates = filtered.slice(start, start + state.pageSize);
    const grid = document.getElementById('company-talents-grid');
    const empty = document.getElementById('company-empty-state');
    document.getElementById('company-results-summary').innerHTML = 'Exibindo <strong>' + filtered.length + '</strong> de ' + candidates.length + ' talentos';
    grid.innerHTML = pageCandidates.map(candidateCard).join('');
    grid.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
    renderPagination(filtered.length);
    renderChips();
    syncMainSearchClear();
  }

  function clearAll() {
    closeFilters();
    closeSort();
    state.query = '';
    state.pcd = false;
    state.page = 1;
    Object.values(state.selected).forEach((selection) => selection.clear());
    mainSearchInput.value = '';
    document.getElementById('company-talent-pcd').checked = false;
    document.querySelectorAll('[data-option-search]').forEach((input) => { input.value = ''; });
    Object.keys(options).forEach((key) => renderFilterOptions(key, ''));
    render();
    mainSearchInput.focus();
  }

  mainSearchClear.addEventListener('click', () => {
    mainSearchInput.value = '';
    state.query = '';
    state.page = 1;
    render();
    mainSearchInput.focus();
  });

  Object.keys(options).forEach((key) => renderFilterOptions(key, ''));

  document.querySelectorAll('.company-filter__trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      closeSort();
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const willOpen = panel.hidden;
      closeFilters(willOpen ? panel.dataset.filterPanel : undefined);
      panel.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        const focusTarget = panel.querySelector('input');
        if (focusTarget) focusTarget.focus();
      }
    });
  });

  sortTrigger.addEventListener('click', () => {
    if (sortMenu.hidden) openSort();
    else closeSort();
  });
  sortTrigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSort();
    }
  });
  sortMenu.addEventListener('keydown', (event) => {
    const items = Array.from(sortMenu.querySelectorAll('[role="menuitemradio"]'));
    const current = items.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSort(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      let next = current;
      if (event.key === 'ArrowDown') next = (current + 1) % items.length;
      if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = items.length - 1;
      items[next].focus();
    }
  });

  document.addEventListener('change', (event) => {
    const option = event.target.closest('[data-filter-option]');
    if (option) {
      const key = option.dataset.filterOption;
      if (option.checked) state.selected[key].add(option.value);
      else state.selected[key].delete(option.value);
      state.page = 1;
      renderFilterOptions(key, getPanel(key).querySelector('[data-option-search]')?.value || '');
      render();
      return;
    }
    if (event.target.id === 'company-talent-pcd') {
      state.pcd = event.target.checked;
      state.page = 1;
      render();
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'company-talent-search') {
      state.query = event.target.value.trim();
      state.page = 1;
      render();
      return;
    }
    if (event.target.matches('[data-option-search]')) renderFilterOptions(event.target.dataset.optionSearch, event.target.value);
  });

  document.addEventListener('click', (event) => {
    const sortOption = event.target.closest('[data-sort]');
    if (sortOption) {
      selectSort(sortOption.dataset.sort);
      return;
    }
    const candidateButton = event.target.closest('[data-candidate-id]');
    if (candidateButton) {
      openProfile(candidateButton.dataset.candidateId, candidateButton);
      return;
    }
    const contact = event.target.closest('[data-profile-contact]');
    if (contact) {
      showLocalToast(contact.dataset.profileContact + ' é um contato demonstrativo neste protótipo.');
      return;
    }
    if (event.target.closest('[data-profile-video]')) {
      showLocalToast('Reprodução de vídeo simulada no protótipo.');
      return;
    }
    const clearFilter = event.target.closest('[data-clear-filter]');
    if (clearFilter) {
      const key = clearFilter.dataset.clearFilter;
      state.selected[key].clear();
      state.page = 1;
      renderFilterOptions(key, '');
      const optionSearch = getPanel(key).querySelector('[data-option-search]');
      if (optionSearch) optionSearch.value = '';
      render();
      return;
    }
    const remove = event.target.closest('[data-remove-filter]');
    if (remove) {
      removeFilter(remove.dataset.removeFilter, remove.dataset.filterValue);
      return;
    }
    if (event.target.closest('[data-remove-pcd]')) {
      state.pcd = false;
      document.getElementById('company-talent-pcd').checked = false;
      render();
      return;
    }
    if (event.target.closest('[data-clear-all]') || event.target.id === 'company-clear-all-empty') {
      clearAll();
      return;
    }
    const pageButton = event.target.closest('[data-page]');
    if (pageButton && !pageButton.disabled) {
      state.page = Number(pageButton.dataset.page);
      render();
      document.querySelector('.company-search__results').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!event.target.closest('.company-filter')) closeFilters();
    if (!event.target.closest('.company-sort')) closeSort();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!sortMenu.hidden) {
        closeSort(true);
        return;
      }
      const openPanel = Array.from(document.querySelectorAll('[data-filter-panel]')).find((panel) => !panel.hidden);
      if (openPanel) {
        const trigger = openPanel.closest('.company-filter').querySelector('.company-filter__trigger');
        closeFilters();
        trigger.focus();
      }
    }
  });

  document.getElementById('candidate-profile-close').addEventListener('click', closeProfile);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeProfile();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProfile();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('candidate-profile-open');
    if (state.modalOrigin && state.modalOrigin.isConnected) state.modalOrigin.focus();
    state.modalOrigin = null;
  });

  render();
}());
