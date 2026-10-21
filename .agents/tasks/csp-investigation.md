# Investigação: violação intermitente de CSP em `admin-student-registration.browser.test.cjs`

Data: 2026-10-16. Etapa: investigação, evidência e baseline. **Nenhum arquivo da aplicação foi editado** (verificação na seção 9). Artefato irmão: `csp-baseline.md` (tabela de execuções do teste real).

## 1. Veredito

- **Hipótese confirmada, com um refinamento.** `viewer.html:13` declara `src="/index.html"` no iframe. Em todo start roteado o navegador requisita a landing como navegação de iframe (`Sec-Fetch-Dest: iframe`) antes de `viewer.js` redirecionar. Quando a landing vence essa corrida, o documento é commitado e o `securitypolicyviolation` dispara nele (`documentURI` = `/index.html`): `style-src-elem` para o Google Fonts (`index.html:12`) e `connect-src` para os três `fetch` de `js/main.js:16`. O `addInitScript` do teste escuta todo documento do iframe, então registra a violação do documento transitório e a asserção final (`14:270`) falha.
- **Refinamento: quem decide a corrida não é sorte do Chrome.** Em cópia nova, a primeira leitura de `viewer.js` leva cerca de 17 a 35 ms, contra cerca de 0,2 ms depois e 1 a 3 ms para `/index.html`. A landing vence. Resultado no teste real: **falhou 8 de 8 vezes como 1ª execução em cópia nova e passou 12 de 12 em execuções quentes**. A causa da lentidão dessa primeira leitura não foi identificada.
- **Correção mínima recomendada:** remover `src="/index.html"` do iframe em `viewer.html` e atribuir `frame.src = "/index.html"` em `viewer.js` apenas no ramo sem rota. São 1 atributo removido e 2 linhas acrescentadas (seção 6).
- **Viável sem arquivos protegidos da lista de parada** (`server.cjs`, `config.cjs`, manifesto, cabeçalho CSP, protocolo v1, IDs de rota, tela, jornada e etapa): nenhum precisa mudar. A correção edita `viewer.html` e `viewer.js`, que o `tech.md` lista como "sem aprovação do usuário"; a mensagem 2 do usuário (item 1) pede exatamente essa correção no carregamento do iframe do viewer. O revisor deve confirmar que isso vale como aprovação.
- **Prévia em cópia descartável (não aplicada ao repo):** com a correção, o teste real passou em 9 de 9 execuções frias, 12 de 12 quentes e 5 de 5 sob atraso determinístico de `viewer.js` (original: 0 de 8, 12 de 12 e 0 de 5). As sequências de `postMessage` dos 11 cenários capturados ficaram idênticas, `npm run check`, `npm run build` e os 5 testes sem navegador passam, e a suíte completa serial passou 8 de 8 (original: 7 de 8).

## 2. Ambiente e método

- Chrome 155.0.8059.80, Playwright 1.62.1 (caminhos do `tech.md`), Node v24.14.0, Windows, PowerShell 5.1, 8 CPUs. Testes de navegador sempre habilitados (skips = 0).
- Instrumentos descartáveis, fora do repo e apagados ao final:
  1. Script Playwright com o **mesmo** `addInitScript` do teste (`CSP_TEST:<blockedURI>`) mais um registro detalhado do evento (`documentURI`, `blockedURI`, `effectiveDirective`, `sourceFile`, `lineNumber`, `disposition`, URL do documento, se é o topo) e dos eventos `request`, `requestfailed`, `response`, `framenavigated`.
  2. Preload de servidor (`node -r`, ativo só quando o script principal é `server.cjs`) que registra cada requisição (instante, `Sec-Fetch-Dest`, aborto) e pode atrasar URLs. Código no Apêndice A.
  3. Página-pai descartável em origem confiável (servida por um servidor HTTP mínimo) que hospeda o viewer em iframe e registra todo `postMessage`. Descrição no Apêndice B.
- Portas: 4230 a 4232 para diagnóstico, 4211 (fixa do teste real) para o baseline. A 4185 (dev server PID 29220, não iniciado por mim) não foi tocada.
- Toda execução ocorreu em cópia temporária (`robocopy` sem `.git`, `node_modules`, `dist`). "Frio" é a 1ª execução numa cópia nova; "quente" são execuções consecutivas na mesma cópia.

## 3. Evidências da causa raiz

### 3.1 Leitura do código

| Local | O que faz | Relevância |
|---|---|---|
| `viewer.html:13` | `<iframe id="sctec-content" … src="/index.html">` | A navegação para a landing começa no parse, antes de qualquer script. |
| `viewer.html:9-10` | `runtime-config.js` (bloqueante) e `viewer.js` com `defer` | `viewer.js` só roda depois do parse. |
| `viewer.js:160` | `frame.addEventListener("load", onContentLoad)` | O ouvinte só existe depois que `viewer.js` executa. Um `load` anterior se perde. |
| `viewer.js:185-190` | com rota: `frame.src = initialRoute.path`; sem rota: nada | Troca o destino do iframe tarde demais para evitar a requisição. Sem rota, a landing vem do `src` do HTML. |
| `viewer.js:157` | `frame.src = screen.path` em `navigate()` | Caminho de hash e de `VIEWER_NAVIGATE`. |
| `index.html:10-12` | dois `preconnect` e `<link rel="stylesheet">` para `fonts.googleapis.com` | `style-src 'self' 'unsafe-inline'` bloqueia a folha externa. |
| `index.html:214`, `js/main.js:16` e `:182` | `DOMContentLoaded` chama `loadComponents()`, que faz `fetch('components/govbar\|navbar\|footer.html')` | `connect-src 'none'` bloqueia os três. |
| `server.cjs:37` | CSP em toda resposta, inclusive `/index.html` | A landing é avaliada pela mesma política. |
| teste, linhas 9 e 14 | `addInitScript` registra a violação em **todo** documento e faz `console.warn("CSP_TEST:"+blockedURI)`; `assert.deepEqual(violations,[])` está em `14:270` | O teste não distingue de qual documento vem a violação. |

### 3.2 `/index.html` é requisitado em start roteado? Sim, sempre

Start roteado `viewer.html#/sctec/admin/students`, cada iteração em contexto novo do Chrome:

| condição | n | `/index.html` requisitado | abortado antes do commit | landing commitada | violação no canal do teste | entrada extra de histórico |
|---|---:|---:|---:|---:|---:|---:|
| Quente: mesmo Chrome e servidor, servidor com log | 60 | 60 | 57 | 3 | 2 | 0 |
| Quente: servidor puro, sem preload | 60 | 60 | 59 | 1 | 1 | 0 |
| Quente sob carga: 8 contextos paralelos | 64 | 64 | 63 | 1 | 1 | 0 |
| Frio: cópia, servidor e Chrome novos por iteração, com log | 20 | 20 | 0 | 20 | 20 | 13 |
| Frio: servidor puro | 20 | 20 | 0 | 20 | 20 | 16 |
| `/viewer.js` atrasado 800 ms | 10 | 10 | 0 | 10 | 10 | 10 |
| `/index.html` atrasado 800 ms | 10 | 10 | 10 | 0 | 0 | 0 |

- Evidência do servidor: `/index.html` chega com `Sec-Fetch-Dest: iframe`, antes de `/pages/admin-alunos.html`. No caso normal o navegador cancela a requisição (`net::ERR_ABORTED`; servidor registra "abortado").
- "Commitada" = `framenavigated` do iframe para `/index.html`. Nesses casos o navegador ainda pediu 6 subrecursos da landing (`css/variables|reset|layout|components|home.css`, `js/main.js`).
- A tela final correta carregou em 100% das iterações (o defeito não é de navegação, é o documento transitório).
- Nenhum `pageerror` em nenhuma iteração.

### 3.3 Violações observadas (registros brutos, `viewer.js` atrasado 800 ms para a landing viver o bastante)

| # | `documentURI` e frame | diretiva efetiva | `blockedURI` | origem |
|---|---|---|---|---|
| 1 | `http://127.0.0.1:<porta>/index.html`, `iframe#sctec-content` (topo = falso) | `style-src-elem` | `https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Roboto:wght@400;500;600;700&display=swap` | `index.html` linha 12 |
| 2 | idem | `connect-src` | `http://127.0.0.1:<porta>/components/govbar.html` | `js/main.js` linha 16 |
| 3 | idem | `connect-src` | `http://127.0.0.1:<porta>/components/navbar.html` | `js/main.js` linha 16 |
| 4 | idem | `connect-src` | `http://127.0.0.1:<porta>/components/footer.html` | `js/main.js` linha 16 |

- Todas com `disposition: enforce`. A sequência de `framenavigated` do iframe foi `/index.html` e depois `/pages/admin-alunos.html`.
- A requisição ao Google terminou em `requestfailed` com erro `csp` e houve **zero respostas externas**: nada foi carregado de fora. Os `preconnect` não geraram violação nem requisição visível; não medi sockets.
- Nas falhas naturais quase sempre só a #1 aparece (a landing é destruída antes do `DOMContentLoaded`, quando os `fetch` rodariam). Nas frias do teste real: 4 falhas com 1 URI e 4 com as 4 URIs.

### 3.4 Por que a landing vence em cópia nova (frio) e perde em cópia quente

Ordem no servidor na última iteração fria do harness (ms desde `/viewer.html`; "serviço" = tempo até terminar o envio):

```text
/viewer.html              chegou   0,0   serviço  2,8
/viewer.css               chegou  25,2   serviço  2,4
/runtime-config.js        chegou  30,6   serviço  2,0
/viewer.js                chegou  34,4   serviço 49,8   <- leitura lenta do disco
/index.html (iframe)      chegou  44,5   serviço  2,2
/pages/admin-alunos.html  chegou 171,4   (iframe; só depois de viewer.js executar)
```

Na última iteração quente, `viewer.js` teve serviço de 3,7 ms e a tela alvo chegou aos 60,8 ms.

- Nessa iteração `viewer.js` chegou antes da landing, mas só terminou depois dela. Em outras iterações frias a ordem de chegada já veio invertida (`/index.html` e subrecursos da landing antes de `/viewer.js`). Frio, 20 de 20: `/index.html` foi pedido de 19 a 74 ms (mediana 39) **antes** de `viewer.js` terminar de ser servido.
- **Lentidão específica de `viewer.js` na 1ª leitura de uma cópia nova**, medida sem o Chrome: `fs.readFileSync` em 8 cópias novas deu mediana 17,3 ms (máx. 20,3) na 1ª leitura e 0,2 ms na 2ª. Os demais arquivos ficam em torno de 1 ms já na 1ª (`index.html` 0,9; `viewer.css` 0,4; `js/main.js` 0,8). Variando a ordem de leitura (8 cópias por ordem), `viewer.js` ficou em 28,3, 28,4 e 35,5 ms e os outros em ≤ 1,6 ms: a lentidão acompanha o arquivo, não "o primeiro `.js` lido". Esperar depois da cópia não resolve (4 cópias por espera, mediana da 1ª leitura: 0 s = 19,1 ms; 3 s = 20,7 ms; 10 s = 19,9 ms).
- **Causa da lentidão não identificada.** Hipótese não confirmada: verificação em tempo real do sistema de arquivos ou do antivírus na primeira abertura desse arquivo.
- **Intervenção causal:** ler todos os arquivos de uma cópia nova uma vez antes de rodar o teste real fez **6 de 6 passarem** (sem isso, 0 de 8). O Chrome é novo em toda execução, então ele não é o fator.
- Correlação no harness quente (60 iterações com log): a landing foi commitada exatamente nas 3 iterações em que `/index.html` foi pedido antes de `viewer.js` terminar (3 de 3, nenhum falso).
- Consequência: "intermitente" significa dependente do estado do sistema de arquivos e da carga. Rodar sempre em cópia nova (regra do `tech.md`) coloca o teste na condição fria. Na suíte serial os testes seguintes encontram a cópia aquecida, e a falha cai em quem roda cedo e não filtra a CSP por página (1 de 8 execuções da suíte falhou, em `admin-companies.browser.test.cjs:72`, mesma URI do Google Fonts).

### 3.5 Pior caso determinístico (a corrida deixa de ser sorte)

- O preload do Apêndice A atrasa `/viewer.js` em 800 ms no servidor. No harness: 10 de 10 landings commitadas, 10 de 10 com as 4 URIs, 10 de 10 com entrada extra de histórico. No **teste real**: 0 de 5 passam, as 5 falham em `14:270` com as 4 URIs.
- O mesmo preload atrasando `/index.html` em 800 ms: 0 de 10 commits e 0 violações (o navegador cancela a requisição em 10 de 10). Mostra os dois lados da corrida.
- Esse é o instrumento para provar a correção no pior caso na etapa de implementação (seção 7).

### 3.6 Efeitos colaterais da corrida, além da CSP

1. Requisição e cancelamento inúteis de `/index.html` em todo start roteado; quando a landing vence, mais 6 requisições de subrecursos.
2. **Entrada extra no histórico:** `history.length` 3 em vez de 2 em 13 de 20 (com log) e 16 de 20 (servidor puro) dos starts frios e em 10 de 10 sob atraso. Visível para o usuário: "Voltar" poderia levar à landing dentro do iframe.
3. **Handshake perdido (latente):** num start sem hash com `viewer.js` atrasado 1200 ms, o `load` da landing dispara antes de o ouvinte existir. Instrumentado: `onContentLoad` rodou **0 vezes** e `VIEWER_READY` não saiu em 4 s. O Design Hub usa `entryUrl` sem hash (`prototype-manifest.json`), ou seja, exatamente esse start.

## 4. Baseline do protocolo `design-hub-prototype` v1 (antes de qualquer mudança)

Página-pai em `http://127.0.0.1:4232` (confiável via `DESIGN_HUB_ORIGINS` na instância temporária), viewer em `:4231`. `V→P` é viewer para pai, `P→V` pai para viewer. `sessionId` normalizado para `<sid>`. Todas as mensagens vieram da janela do viewer, com `origin` do viewer. Duas execuções independentes produziram **sequências idênticas nos 11 cenários**; só o `history` de S1 depende da corrida.

```text
S1  start roteado (viewer.html#/sctec/admin/students)
    V→P VIEWER_READY {"capabilities":["navigate"],"sessionId":"<sid>"}       ~165-290 ms após o iframe.src do pai
    final: /pages/admin-alunos.html | #/sctec/admin/students | history 3 (landing commitada) ou 2

S2  start sem hash (viewer.html)
    V→P VIEWER_READY {...}                                                     ~105-160 ms
    final: /index.html | hash vazio | history 2

S3  start com hash inválido (#/sctec/does-not-exist)
    V→P VIEWER_READY {...}                                                     ~90-105 ms
    final: /index.html | #/sctec/does-not-exist (não é reescrito) | history 2

S4a mudança de hash no viewer (students -> #/sctec/admin/companies)
    V→P VIEWER_READY {...}
    (nenhuma mensagem após a mudança de hash)
    final: /pages/admin-empresas.html | #/sctec/admin/companies | history 4
S4b clique em a.sidebar__link[href=admin-empresas.html] (admin-shell.js muda parent.location.hash)
    idem S4a, history 4
S4c navegação interna do iframe por href (location.href = "admin-empresas.html")
    V→P VIEWER_READY {...}
    V→P VIEWER_SCREEN_CHANGED {"screenId":"sctec-admin-companies","sessionId":"<sid>","sequence":1}   ~100 ms após a ação
    final: /pages/admin-empresas.html | #/sctec/admin/companies (via replaceState) | history 3

S5a VIEWER_NAVIGATE válido (students -> companies)
    V→P VIEWER_READY {...}
    P→V VIEWER_NAVIGATE requestId=req-1 {"screenId":"sctec-admin-companies","route":"#/sctec/admin/companies"}
    V→P VIEWER_NAVIGATION_RESULT requestId=req-1 {"ok":true}                   ~100 ms depois, após o load; sem SCREEN_CHANGED
    final: /pages/admin-empresas.html | #/sctec/admin/companies | history 3
S5b VIEWER_NAVIGATE para a tela já exibida
    P→V VIEWER_NAVIGATE requestId=req-1 {"screenId":"sctec-admin-students","route":"#/sctec/admin/students"}
    V→P VIEWER_NAVIGATION_RESULT requestId=req-1 {"ok":true}                   ~1 ms
    final: sem mudança | history 2
S5c VIEWER_NAVIGATE a partir do start sem hash (fluxo do Design Hub: landing -> login)
    V→P VIEWER_READY {...}
    P→V VIEWER_NAVIGATE requestId=req-1 {"screenId":"sctec-login","route":"#/sctec/talent-login"}
    V→P VIEWER_NAVIGATION_RESULT requestId=req-1 {"ok":true}                   ~30 ms
    final: /pages/login.html | #/sctec/talent-login | history 3
S5d mensagens inválidas (a partir do start roteado)
    P→V NAVIGATE bad-1 {"screenId":"sctec-nao-existe",...}  V→P RESULT bad-1 {"ok":false,"errorCode":"INVALID_SCREEN"}
    P→V NAVIGATE bad-2 {"screenId":"sctec-admin-companies","route":"#/sctec/admin/students"}
                                                              V→P RESULT bad-2 {"ok":false,"errorCode":"INVALID_ROUTE"}
    P→V NAVIGATE bad-3 {"screenId":7,"route":null}           V→P RESULT bad-3 {"ok":false,"errorCode":"INVALID_ROUTE"}
    P→V VIEWER_SET_PROFILE prof-1 {"profile":"admin"}        V→P VIEWER_PROFILE_RESULT prof-1 {"ok":false,"errorCode":"UNSUPPORTED"}
    final: sem mudança | history 2
S5e dois VIEWER_NAVIGATE em sequência (req-1 companies, req-2 users)
    V→P VIEWER_NAVIGATION_RESULT requestId=req-1 {"ok":false,"errorCode":"FAILED"}   imediato (pendência substituída)
    V→P VIEWER_NAVIGATION_RESULT requestId=req-2 {"ok":true}                          ~110 ms
    final: /pages/admin-usuarios.html | #/sctec/admin/users | history 3
```

- `history` é `history.length` da aba, lido na página-pai; o valor absoluto inclui as entradas da própria página-pai. Compare só entre execuções do mesmo harness.
- Os dados normalizados estão em `%TEMP%\sctec-baseline\protocol-baseline.json` (fora do repo).
- S2, S3 e S5c passam pela landing de propósito e registram as 4 violações dela. S5c também registra Google Fonts de `/pages/login.html` e S5e um script inline de `/pages/admin-usuarios.html`: ambos são páginas legadas já conhecidas (`sctec-progress.md`) e não têm relação com esta frente.

## 5. Efeito da correção sobre o viewer

Medido em cópia descartável com a correção aplicada. Para o handler `load` usei uma linha de `console.debug` no início de `onContentLoad`, **só na cópia**.

| Aspecto | Código atual | Com a correção |
|---|---|---|
| Handler `load` (`viewer.js:160`, `onContentLoad` em `:96`) | Pode perder o `load` da landing se `viewer.js` for lento: 0 chamadas no start sem hash com +1200 ms. Em start roteado roda 1 vez, com a tela alvo. | O ouvinte já existe quando `src` é atribuído. Rodou **exatamente 1 vez** nos 4 casos instrumentados (roteado, sem hash, roteado +800 ms, sem hash +1200 ms), sempre com o caminho da página real. Nenhuma chamada com `about:blank` no Chrome 155. |
| `frameReady` (`:32`) | `false` até o 1º `load` observado | Igual: `false` na entrada de todas as chamadas medidas, `true` só depois da página real. |
| Timing de `VIEWER_READY` (n = 12, mediana, sem preload) | roteado 257,5 ms (165-287); sem hash 117 ms (105-157); pode nunca sair (3.6) | mesmo evento, mesma ordem, mesmo payload. roteado 182 ms (143-256); sem hash 134 ms (114-179), cerca de 17 ms mais tarde porque a landing só é pedida quando `viewer.js` roda. Com `viewer.js` +1200 ms o evento **sai** (1331 ms). |
| `VIEWER_SCREEN_CHANGED` (`:107`) | só em transição aninhada genuína; `currentScreenId` inicial é `"sctec-home"` (`:31`), fora de `screens` | inalterado: nada na lógica de `:31` e `:96-116` muda. S4c idêntico. |
| `history.replaceState` (`:104`, `:138`, `:155`) | independe do `src` default; porém a landing commitada deixa uma entrada extra | mesmos efeitos. `history.length` do start roteado fica determinístico em 2. |
| `sctecConfirmNavigation` (`:131-141`) | lê `frame.contentWindow?.sctecConfirmNavigation`; só `js/admin-empresa-cadastro.js:205` define o gancho | até a 1ª página real, `contentWindow` é o `about:blank` do mesmo origin (sem gancho, `undefined`), igual à landing atual (também sem gancho). Depois, nada muda. O `try/catch` do caso cross-origin permanece. |
| `scripts/build-staging.cjs` | copia a raiz (exceto `.git`, `dist`, `node_modules`) com `fs.cpSync` (`:15`) e só reescreve `entryUrl` no manifesto e `runtime-config.js` (`:21`) | `npm run build:staging` com origens de exemplo: exit 0, `dist/viewer.html` e `dist/viewer.js` **byte-idênticos** à fonte corrigida, sem `src` no iframe. O script não precisa mudar. |
| `scripts/validate-manifest.cjs` | `mappingRegex` (`:23`) só casa as 15 linhas `"id": Object.freeze({ route, path })` | o `else` não casa. `npm run check` e `npm run build`: 15 telas, 9 jornadas, 26 etapas. 5 testes sem navegador: 5 de 5. |
| Outros leitores do `src` | nenhum no repo (busca por `sctec-content`, `frame.src`, `getAttribute('src')`, `contentWindow`) | n/a. O Design Hub é externo e não foi inspecionado. |

Paridade do protocolo (S1 a S5e, 2 execuções originais contra 2 com a correção): sequências normalizadas **idênticas nos 11 cenários**, mesmo `contentPath` e mesmo hash final. `history` idêntico, exceto S1 (3 para 2), cujo 3 original é o sintoma da corrida (o mesmo start roteado dá 2 em S5b e S5d, quando a landing é abortada). Nos cenários roteados `/index.html` deixou de ser requisitado; em S2, S3 e S5c, onde a landing é o destino, continua sendo.

## 6. Correção mínima recomendada (não aplicada ao repo)

```diff
--- a/viewer.html
+++ b/viewer.html
@@ -10,7 +10,7 @@
     <script defer src="viewer.js"></script>
   </head>
   <body>
-    <iframe id="sctec-content" title="Protótipo SCTEC" src="/index.html"></iframe>
+    <iframe id="sctec-content" title="Protótipo SCTEC"></iframe>
     <p id="viewer-error" role="status" hidden></p>
   </body>
 </html>
--- a/viewer.js
+++ b/viewer.js
@@ -186,5 +186,7 @@
   if (initialRoute) {
     currentScreenId = initialRoute.id;
     frame.src = initialRoute.path;
+  } else {
+    frame.src = "/index.html";
   }
 })();
```

O mesmo diff está em `%TEMP%\sctec-baseline\proposed-fix.diff`. Os dois arquivos terminam em CRLF e o resto usa LF; preserve isso ao editar.

Por que esta correção:

1. Remove a navegação desnecessária em vez de esconder o sintoma: em start roteado a landing nunca é pedida, qualquer que seja a latência de `viewer.js`.
2. Dois arquivos e três linhas. Sem CSP afrouxada, sem recurso externo, sem JavaScript inline, sem tocar em `server.cjs`, `config.cjs`, manifesto, protocolo ou IDs.
3. Preserva o contrato: o ramo sem rota inclui o hash inválido (`routes.get` devolve `undefined`) e continua mostrando a landing com `VIEWER_READY` no `load`.
4. Fecha de graça o handshake perdido e a entrada extra de histórico (3.6).

Alternativas descartadas:

- **Filtrar a violação por página no teste** (como outros testes já fazem com `location.pathname`): esconde o sintoma, o que o pedido proíbe, e mantém a requisição inútil, o histórico extra e o handshake perdido.
- **Tirar o Google Fonts e o `fetch` de `index.html`/`js/main.js`**: mexe na landing (fora do escopo, "não alterar layouts não relacionados") e não evita a navegação transitória.
- **Mover `viewer.js` para o fim do `body` ou pré-carregá-lo**: a navegação do iframe continua começando no parse. Só reduz a janela.
- **Pré-aquecer a cópia antes do teste**: mascara no teste, não corrige o viewer.
- **Mexer em `server.cjs`** (cache, ordem de envio): arquivo protegido e não remove a corrida.

Riscos residuais:

- `viewer.*` está na lista "sem aprovação do usuário" do `tech.md` (ver seção 1).
- Sem JavaScript o iframe fica em branco (antes mostrava a landing). O viewer já exige JS (`runtime-config.js`, `viewer.js`).
- O `VIEWER_READY` do start sem hash sai cerca de 17 ms depois.
- **Só o Chrome 155 foi testado.** Em outros motores o `load` inicial de um iframe sem `src` pode ser assíncrono (relato de 2016 em [whatwg/html#490](https://github.com/whatwg/html/issues/490): Chrome e Safari síncrono, Firefox e Edge assíncrono; comportamento atual não verificado). Se ocorrer depois de `viewer.js` registrar o ouvinte, `onContentLoad` rodaria uma vez com caminho `blank`: `frameReady` ficaria `true` e `VIEWER_READY` sairia antes da página real. Reforço opcional, fora da correção mínima: ignorar o `load` enquanto `currentPath()` for `blank`. Content was rephrased for compliance with licensing restrictions.
- A landing continua gerando as 4 violações quando é exibida de propósito (S2, S3, S5c). É anterior a esta frente.
- O E2E do Design Hub (repositório externo, `README.md`) não foi executado nesta etapa.

## 7. Plano de verificação para a etapa de implementação

1. `npm run check`, `npm run build` e `node --test --test-concurrency=1 tests/config.test.cjs tests/manifest.test.cjs tests/server.test.cjs`.
2. Teste real em cópia temporária, variáveis do `tech.md` definidas, serial: ≥ 5 execuções frias (cópia nova), ≥ 5 quentes e ≥ 3 no pior caso (Apêndice A, `viewer.js` +800 ms). Todas devem passar, com skips = 0. Referência da prévia no `csp-baseline.md`, seção 5.
3. Suíte completa serial (`node --test --test-concurrency=1`) em ≥ 3 cópias novas, reportando testes, passes, falhas e skips.
4. Paridade do protocolo: repetir os cenários S1 a S5e (Apêndice B) e comparar com a seção 4. Esperado: sequências iguais, `history` 2 em S1, `/index.html` não requisitado nos cenários roteados e ainda requisitado em S2, S3 e S5c.
5. Teste de regressão (mexe em `tests/`, precisa de aprovação): em `admin-student-registration.browser.test.cjs`, registrar `page.on("request")` e `page.route("**/viewer.js", …)` com 800 ms e afirmar que `/index.html` não foi requisitado no start roteado. Falha no código atual, passa com a correção.
6. `build:staging` com origens de exemplo (`SCTEC_ENV=staging`, HTTPS): `dist/viewer.html` sem `src` no iframe. `dist/` é ignorado pelo Git.
7. `git status` ao final (sem commit-base, tudo aparece como não rastreado).

## 8. Observações fora do escopo (não alterar nesta frente)

- Mudança de hash e links do shell (S4a e S4b) **não** emitem `VIEWER_SCREEN_CHANGED`: `navigate()` define `currentScreenId` antes do `load`. É o contrato atual e a correção o preserva.
- Vários testes só contam violações da própria página (`location.pathname.endsWith(...)` em `admin-companies` no 1º teste e em `admin-company-registration*`), por isso não sofrem a falha. Os que contam tudo (este, `admin-company-refinements`, `admin-students`, o 2º de `admin-companies`) estavam expostos.
- A afirmação do `sctec-progress.md` de que o viewer carrega `/index.html` antes da rota inicial está **confirmada**. Atualizar esse arquivo e o `tech.md` (nota sobre falhas em paralelo) é trabalho da etapa de implementação.

## 9. Integridade, limpeza e limites

- **Nenhum arquivo da aplicação foi alterado.** Inventário SHA-256 de 160 arquivos antes e depois (exclui `.git`, `node_modules`, `dist`, `.agents`): 0 modificados, 0 removidos, 1 adicionado, `docs/figma-admin-students-audit.md`, que é da frente irmã e não minha. `viewer.html` e `viewer.js` são idênticos ao snapshot.
- Snapshot pristino fora do repo, em `%TEMP%\sctec-baseline\`: `viewer.html` (SHA-256 `4f743f7073d1993a9f2481fe03e2af94543d844aef3fec90e7f6b447aefae12a`), `viewer.js` (`97bb1a05ef2f868755651f88e7dcbf3243687041399f7a2242a5b67a99dab6ae`), `SHA256SUMS.txt`, `repo-hashes-before.txt`, `protocol-baseline.json`, `proposed-fix.diff`.
- Únicas escritas no repo: `.agents/tasks/csp-investigation.md` e `.agents/tasks/csp-baseline.md`.
- Limpeza: cópias `%TEMP%\sctec-run-*` e a pasta de scripts descartáveis (`%TEMP%\sctec-diag`) removidas; só `%TEMP%\sctec-baseline` permanece. `%TEMP%\sctec-audit`, que existia no início e é de outra frente, eu não toquei e já não existia quando conferi ao final. O dev server da porta 4185 (PID 29220) segue ativo e nenhuma porta de teste ou diagnóstico ficou aberta.
- `git status --short`: todo o repositório aparece como não rastreado (`??`), incluindo `.agents/`. Sem commit-base, `git diff` não compara.
- Limites: Chrome 155 apenas; amostras pequenas; máquina única; causa da lentidão da 1ª leitura de `viewer.js` desconhecida; Design Hub não inspecionado nem executado; fidelidade ao Figma e acessibilidade não avaliadas (fora do escopo).

## Apêndice A. Preload que atrasa URLs no servidor (pior caso determinístico)

Salve fora do repo (por exemplo `%TEMP%\sctec-diag\preload.cjs`). Age só no processo cujo script principal é `server.cjs`; não altera o arquivo.

```js
"use strict";
const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");
const { performance } = require("node:perf_hooks");

if (path.basename(process.argv[1] || "") === "server.cjs") {
  const delays = JSON.parse(process.env.SCTEC_DELAYS || "[]").map((d) => ({ re: new RegExp(d.match), ms: d.ms }));
  const log = process.env.SCTEC_REQLOG || "";
  const now = () => performance.timeOrigin + performance.now();
  const origEmit = http.Server.prototype.emit;
  http.Server.prototype.emit = function patchedEmit(event, req, res) {
    if (event !== "request") return origEmit.apply(this, arguments);
    const self = this;
    const args = Array.from(arguments);
    const rec = { tReq: now(), url: req.url, dest: req.headers["sec-fetch-dest"] || "" };
    let written = false;
    const write = () => { if (!written) { written = true; if (log) fs.appendFileSync(log, JSON.stringify(rec) + "\n"); } };
    res.on("finish", () => { rec.tDone = now(); rec.status = res.statusCode; write(); });
    res.on("close", () => { if (!res.writableFinished) { rec.aborted = true; rec.tClose = now(); write(); } });
    const d = delays.find((x) => x.re.test(String(req.url).split("?")[0]));
    if (d) { rec.delayMs = d.ms; setTimeout(() => origEmit.apply(self, args), d.ms); return true; }
    return origEmit.apply(self, args);
  };
}
```

Uso com o teste real (PowerShell, na cópia temporária; use barras normais no caminho):

```powershell
$env:NODE_OPTIONS = '--require C:/Users/leonardo.meirelles/AppData/Local/Temp/sctec-diag/preload.cjs'
$env:SCTEC_DELAYS = '[{"match":"^/viewer\\.js$","ms":800}]'
node --test --test-concurrency=1 tests/admin-student-registration.browser.test.cjs
Remove-Item Env:NODE_OPTIONS, Env:SCTEC_DELAYS
```

Para registrar as requisições, defina também `SCTEC_REQLOG` com um caminho de arquivo (uma linha JSON por requisição, com `dest` = `iframe` na landing).

## Apêndice B. Página-pai descartável e cenários de paridade

- Servidor de teste do viewer: `server.cjs` da cópia temporária com `PORT=4231` e `DESIGN_HUB_ORIGINS=http://127.0.0.1:4232`. A página-pai é servida em `4232` por um `http.createServer` mínimo, sem CSP, e contém:

```html
<iframe id="v" referrerpolicy="no-referrer" style="width:1300px;height:850px;border:0"></iframe>
<script>
  const VIEWER = "http://127.0.0.1:4231", v = document.getElementById("v"), T0 = performance.now();
  window.LOG = [];
  function rec(o) { LOG.push(Object.assign({ t: Math.round(performance.now() - T0) }, o)); }
  addEventListener("message", (e) => rec({ dir: "viewer->parent", origin: e.origin, fromViewerWindow: e.source === v.contentWindow, data: e.data }));
  window.loadViewer = (suffix) => { rec({ dir: "parent", note: "iframe.src = viewer.html" + suffix }); v.src = VIEWER + "/viewer.html" + suffix; };
  window.send = (data) => { rec({ dir: "parent->viewer", data }); v.contentWindow.postMessage(data, VIEWER); };
</script>
```

- O Playwright abre a página-pai e executa, em contexto novo por cenário: `loadViewer(<sufixo>)`, espera `VIEWER_READY` em `LOG` e então a ação. Ações: S4a muda `location.hash` no frame do viewer; S4b clica o link da sidebar no frame de conteúdo; S4c faz `location.href = "admin-empresas.html"` no frame de conteúdo; S5x chama `send({protocol:"design-hub-prototype",version:1,type:"VIEWER_NAVIGATE",requestId,payload:{screenId,route}})`. Ao final lê `LOG` e o estado (`pathname` do frame de conteúdo, `location.hash` do viewer, `history.length` da página-pai).
- Normalização para comparar: `sessionId` vira `<sid>`, tempos são descartados, mensagens ficam como `tipo requestId payload`.
- Para o handshake perdido, use S2 com o preload do Apêndice A atrasando `/viewer.js` em 1200 ms e espera de `VIEWER_READY` de 4 s.
