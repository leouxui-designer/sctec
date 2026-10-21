---
inclusion: always
---

# SCTEC Portal de Talentos: estrutura do repositório

## Raiz
- `viewer.html|js|css`: viewer (iframe, roteamento por hash, protocolo Design Hub). `prototype-manifest.json`: 19 telas, 11 jornadas, 32 etapas; `profiles` e `capabilities` vazios.
- `server.cjs`, `config.cjs`: servidor estático, CSP, CORS do manifesto e origens confiáveis.
- `index.html`: landing institucional, fora do shell. `pages/`: uma tela por arquivo. `pages/_deprecated/`: legado fora da navegação (não editar).
- `css/`, `js/`, `assets/`, `components/`, `scripts/`, `tests/`, `docs/`.
- Proveniência (não editar): `SOURCE-SHA256SUMS.txt`, `MIGRATION-RECORD.md`. Regras de agente: `AGENTS.md` e `.kiro/steering/`.

## Rotas e páginas (fonte: `viewer.js` e manifesto)
- Login: `#/sctec/talent-login` para `login.html`.
- Admin `#/sctec/admin/...`: `students` (admin-alunos), `student-profile` (admin-aluno-perfil), `student-create` (admin-aluno-cadastro), `companies` (admin-empresas), `company-create` (admin-empresa-cadastro), `company-edit` (admin-empresa-editar), `users` (admin-usuarios), `user-create` (admin-usuario-cadastro), `tags` (admin-tags).
- Empresa `#/sctec/company/...`: `candidates` (painel-candidatos), `profile` (painel-perfil).
- ACATE `#/sctec/acate/...`: `companies` (acate-empresas), `company-profile` (acate-empresa-perfil, leitura) e `company-edit` (acate-empresa-editar, edição simulada).
- Aluno `#/sctec/student/...`: `companies` (aluno-empresas), `profile` (aluno-perfil), `company-profile` (empresa-perfil-publico).
- Compartilhada: `#/sctec/talent/public-profile` (aluno-perfil-publico).
- IDs de telas, jornadas e etapas (`sctec-admin-companies`, ...) são estáveis: só os rótulos mudam.
- Tela nova no shell exige atualizar juntos `viewer.js` (`screens`), o manifesto, o mapa `routes` de `js/admin-shell.js` e `js/profile-navigation.js`, e as asserções de `scripts/validate-manifest.cjs`. É mudança de contrato: peça aprovação.

## Convenções
- Uma tela costuma ter `pages/admin-<tela>.html`, `css/admin-<tela>.css` e `js/admin-<tela>.js`, mais teste e doc. Os nomes nem sempre se espelham (`admin-aluno-cadastro` usa `admin-student-registration.*`): siga o par existente.
- Importação de estudantes (dentro de `admin-alunos.html`): diálogo e arquivo em `admin-student-registration-method.*`; tabela de resultados editável, validação e confirmação simulada em `admin-student-import-results.*` (os dois falam por eventos do DOM `student-import:open` e `student-import:close`); teste `admin-student-import.browser.test.cjs`.
- Ordem do CSS: `variables`, `reset`, `layout`, `components`, `painel`, CSS da tela. Tokens em `css/variables.css` (`--color-*`, `--spacing-*`, `--font-*`). `painel.css` traz o shell e os componentes do painel. O CSS da tela usa prefixo BEM próprio (`student-registration__section`, `navbar--admin`).
- Shell admin (`navbar--admin` e `sidebar--admin`): copie de `pages/admin-aluno-cadastro.html` (a marcação se repete por página). `<body class="admin-page ...">`. Scripts `defer` no fim: JS da tela, `admin-shell.js`, `profile-navigation.js`.
- JS: IIFE com `"use strict"`, sem módulos e sem globais (exceção: `window.sctecConfirmNavigation`). Modais com `<dialog>` e `showModal()`, foco devolvido ao acionador, `aria-invalid` e `aria-describedby` nos erros. IDs e `data-*` são estáveis porque os testes dependem deles.
- Compartilhados: `js/admin-shell.js` (menu do avatar, navegação no viewer, ícones da sidebar), `js/profile-navigation.js` (logo leva à primeira entrada do menu), `js/login.js`, `css/painel.css`, `assets/admin-figma/*` e `assets/admin-fonts/*`.
- ACATE: shell em `acate-shell.*`; listagem em `acate-empresas.*`; detalhe somente leitura em `acate-empresa-perfil.*`.
- `components/` (govbar, navbar, footer) e `js/main.js` servem só às páginas institucionais.

## Documentação e testes
- `docs/`: um `.md` por frente (auditoria Figma, depois implementação) com nós do Figma, decisões, adaptações, incertezas e validação. Capturas `.png` em `docs/`; as de alunos em `docs/screenshots/`.
- `tests/<frente>.browser.test.cjs`: um arquivo por frente, porta própria, viewports 1440x960 e 390x844, tela acessada por `page.frameLocator("#sctec-content")`. Fixture: `tests/fixtures/admin-students-import.csv`.
