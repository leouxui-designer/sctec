---
inclusion: always
---

# SCTEC Portal de Talentos: tecnologia (verificado em 2026-10-16)

## Stack
- HTML, CSS e JavaScript puros, multipágina (um HTML por tela). Sem React, roteador, bundler, TypeScript nem backend.
- Node.js (local: v24.14.0, npm 11.9.0) só para o servidor estático (`server.cjs`, módulos nativos) e para os testes (`node:test`).
- Zero dependências npm: sem `npm install` e sem lockfile. Shell: PowerShell no Windows (use `;`, não `&&`).

## Comandos (na raiz do repositório)
- `npm run dev`: `node server.cjs` em `http://127.0.0.1:4185` (`PORT` altera). Antes, confira a porta: pode já haver um servidor ativo servindo esta pasta. Não inicie outro nem encerre o existente sem pedir.
- `npm run check`: `node --check` (server, viewer, main.js) e `scripts/validate-manifest.cjs`. `npm run build` é igual a `check`.
- `npm test`: `node --test`. Use `npm test -- --test-concurrency=1`; em paralelo há falhas intermitentes por CSP da landing carregada pelo viewer.
- `npm run build:staging`: exige `SCTEC_ENV=staging`, `SCTEC_VIEWER_ORIGIN` e `DESIGN_HUB_ORIGINS` (HTTPS, origens exatas). Gera `dist/`, ignorado pelo Git.
- URLs: viewer `http://127.0.0.1:4185/viewer.html#/sctec/<rota>`; página isolada `http://127.0.0.1:4185/pages/<arquivo>.html`.

## Viewer
- `viewer.html` tem o iframe `#sctec-content` (sem `src`: `viewer.js` define a rota inicial do hash ou, sem hash válido, `/index.html`, para que a landing com Google Fonts não carregue antes da rota) e carrega `runtime-config.js` (gerado pelo servidor, não existe em disco) e `viewer.js`.
- A rota `#/sctec/...` corresponde ao mapa `screens` de `viewer.js` e ao `prototype-manifest.json` (rota sem `#`). `scripts/validate-manifest.cjs` compara manifesto, `viewer.js` e arquivos de página, e fixa 19 telas e 11 jornadas.
- Protocolo `design-hub-prototype` v1: o viewer envia `VIEWER_READY` e `VIEWER_SCREEN_CHANGED`; responde `VIEWER_NAVIGATE` com `VIEWER_NAVIGATION_RESULT` e `VIEWER_SET_PROFILE` com `UNSUPPORTED`. Origens confiáveis vêm de `config.cjs` (`DESIGN_HUB_ORIGINS`; padrão local 127.0.0.1:5173 e :5186).
- Páginas com rascunho podem expor `window.sctecConfirmNavigation(proceed, cancel)`; o viewer a consulta antes de trocar o iframe.
- Dentro do viewer, links entre telas mudam `window.parent.location.hash` (`js/admin-shell.js`, `js/profile-navigation.js`). Fora dele, navegam por `href`.

## CSP (cabeçalho enviado por `server.cjs` em toda resposta)
`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-ancestors 'self' <origens do Design Hub>`
- Sem `<script>` inline, sem atributos `on*=`, sem `eval`. JavaScript só em `js/*.js` com `<script src defer>`.
- Sem `fetch`/XHR, nem para arquivos locais. Por isso o shell admin é repetido em cada página, sem includes.
- Sem CDN, Google Fonts nem imagens remotas. Fontes locais: `@font-face` "SCTEC Admin Montserrat/Roboto" em `css/painel.css`, arquivos em `assets/admin-fonts/`. Ícones: SVG locais em `assets/admin-figma/`. Imagens enviadas pelo usuário: `FileReader`/data URL (sem `blob:`).
- Estilo inline é aceito pela política, mas prefira CSS externo.

## Testes (`tests/*.test.cjs`)
- 16 testes (contagem de 2026-10-16, tarde): 5 de config, manifesto e servidor, e 11 de navegador em 10 arquivos `*.browser.test.cjs` (Playwright e Chrome). Se o total de navegador mudar, o relatório precisa dizer quantos rodaram e quantos ficaram em skip.
- Os de navegador ficam em **skip sem `SCTEC_PLAYWRIGHT_PATH`**. Um `npm test` verde sem as variáveis não prova nada sobre a interface. Todos falham em `pageerror`; todos menos `admin-company-actions` também falham em `securitypolicyviolation` (violação de CSP).
- Playwright não é dependência do repositório. Variáveis (PowerShell):
  - `$env:SCTEC_PLAYWRIGHT_PATH='C:\Users\leonardo.meirelles\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'` (alternativa, só leitura: `C:\Users\leonardo.meirelles\Documents\figma-sd\node_modules\playwright`)
  - `$env:SCTEC_CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'`
- Cada teste sobe o próprio `server.cjs` em porta fixa (faixa 4199-4212; a 4212 é de `admin-student-import`). Nenhum usa a 4185. A 4205 é usada por dois testes (`admin-company-actions` e `company-search-talents`): não os rode em paralelo.
- `admin-company-registration*.browser.test.cjs` gravam PNG em `docs/` (caminho relativo ao cwd). Enquanto não houver commit-base, rode a suíte numa cópia temporária sem `.git` e apague-a depois.

## Restrições de dependência
- Não adicionar pacotes npm (nem devDependencies), CDNs, frameworks, backend, Supabase, credenciais ou serviços remotos. Qualquer exceção exige necessidade justificada e aprovação do usuário.
- Não alterar `server.cjs`, `config.cjs`, `viewer.*`, manifesto, CSP nem protocolo sem aprovação do usuário.
