# Baseline: `tests/admin-student-registration.browser.test.cjs` (código original)

Data: 2026-10-16. Etapa de investigação e baseline: **nenhum arquivo da aplicação foi editado**. Este arquivo registra execuções reais do teste de navegador antes de qualquer correção. A análise de causa raiz está em `csp-investigation.md` (mesma pasta).

## 1. Condições de medição

| Item | Valor |
|---|---|
| Teste | `tests/admin-student-registration.browser.test.cjs` (1 teste: "Cadastro de estudante: método, validação, menor, sucesso, navegação, mobile e CSP") |
| Comando por execução (cwd = cópia temporária) | `node --test --test-concurrency=1 tests/admin-student-registration.browser.test.cjs` |
| Navegador | Chrome 155.0.8059.80 (`SCTEC_CHROME_PATH`), headless, Playwright 1.62.1 (`SCTEC_PLAYWRIGHT_PATH`) |
| Node / SO | v24.14.0 / Windows, PowerShell 5.1, 8 CPUs, 31,7 GB |
| Skips | **0 em todas as execuções**. Variáveis de ambiente definidas conforme `tech.md`. Uma execução com skip teria sido descartada e refeita. |
| Cópia | `robocopy <repo> %TEMP%\sctec-run-<id> /E /XD .git node_modules dist`. O teste nunca rodou na raiz do repo. |
| Porta | a fixa do teste (4211), conferida livre antes de cada execução. A porta 4185 (dev server PID 29220, não iniciado por mim) não foi tocada. |
| Serialização | uma execução por vez |
| **Frio** | 1ª execução numa cópia recém-criada |
| **Quente** | execuções consecutivas na mesma cópia |

## 2. Tabela de baseline (código original)

| cenário | execuções | passes | falhas | skips |
|---|---:|---:|---:|---:|
| Frio: 1ª execução em cópia nova | 8 | 0 | 8 | 0 |
| Quente: 12 execuções consecutivas na mesma cópia | 12 | 12 | 0 | 0 |
| **Total do baseline** | **20** | **12** | **8** | **0** |

Notas:

- As 8 execuções frias são 7 cópias dedicadas (uma execução cada) mais a 1ª execução da cópia usada no grupo quente. As 12 quentes vieram depois dessa execução, na mesma cópia.
- Duração por execução (ms, mín / mediana / máx): frio 4191 / 4730 / 5337; quente 3992 / 4754 / 5324.
- O requisito mínimo (≥ 10 execuções, ≥ 5 frias em cópia nova, ≥ 5 quentes consecutivas) foi cumprido com folga.

## 3. Assinatura da falha (as 8 falhas frias são idênticas)

Todas falham na **asserção final de CSP**, `assert.deepEqual(violations, [])`, na linha 14, coluna 270 do arquivo de teste, depois de todas as ações funcionais do teste terem passado:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ actual - expected
+ [
+   'CSP_TEST:https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Roboto:wght@400;500;600;700&display=swap'
+ ]
- []
    at TestContext.<anonymous> (...\tests\admin-student-registration.browser.test.cjs:14:270)
```

- 4 das 8 falhas frias listam só essa URI; as outras 4 listam 4 URIs (a de Google Fonts mais `http://127.0.0.1:4211/components/govbar.html`, `.../navbar.html` e `.../footer.html`).
- Todos os `blockedURI` são recursos que só a landing `/index.html` referencia (Google Fonts em `index.html:12`, `components/*.html` buscados por `js/main.js:16`), nunca da tela testada. O teste imprime só o `blockedURI`; documentURI, diretiva, arquivo e linha foram medidos à parte e estão em `csp-investigation.md`, seção 3.3.

## 4. Diagnósticos complementares (não entram no total acima)

| cenário diagnóstico | execuções | passes | falhas | skips | o que prova |
|---|---:|---:|---:|---:|---|
| Frio com pré-aquecimento: cópia nova, todos os arquivos da cópia lidos uma vez antes do teste | 6 | 6 | 0 | 0 | A falha fria depende da primeira leitura de arquivos da cópia nova, não de o Chrome ser novo (o Chrome é novo em toda execução). |
| Pior caso determinístico: `/viewer.js` atrasado 800 ms no servidor (preload `NODE_OPTIONS`, sem tocar no repo) | 5 | 0 | 5 | 0 | A falha é reproduzível sob demanda; as 5 falhas listam as 4 URIs bloqueadas da landing. |
| Suíte completa serial (`node --test --test-concurrency=1`), cópia nova por execução, 14 testes | 8 | 7 | 1 | 0 | A mesma causa derruba outros testes: a falha foi em `tests/admin-companies.browser.test.cjs:72` ("Estado vazio Figma…"), asserção de CSP, mesma URI de Google Fonts. |

Contagem de testes na suíte completa: 8 execuções × 14 testes = 112 testes executados, 111 passes, 1 falha, **0 skips**.

## 5. Referência para a próxima etapa: mesma bateria com a correção proposta

A correção recomendada (ver `csp-investigation.md`, seção 6) foi aplicada **somente em cópias temporárias** (o repo continua intacto) para dar à etapa de implementação um alvo de comparação. Não substitui a validação da implementação real.

| cenário | execuções | passes | falhas | skips |
|---|---:|---:|---:|---:|
| Frio (1ª execução em cópia nova) | 9 | 9 | 0 | 0 |
| Quente (12 consecutivas) | 12 | 12 | 0 | 0 |
| Pior caso determinístico (`/viewer.js` +800 ms) | 5 | 5 | 0 | 0 |
| Suíte completa serial, cópia nova por execução (14 testes) | 8 | 8 | 0 | 0 |

## 6. Como repetir (para a etapa de implementação)

```powershell
$env:SCTEC_PLAYWRIGHT_PATH='C:\Users\leonardo.meirelles\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
$env:SCTEC_CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
$dir = Join-Path $env:TEMP 'sctec-run-verif'
robocopy 'c:\Users\leonardo.meirelles\Documents\prototypes\sctec-portal-talentos' $dir /E /XD .git node_modules dist /NFL /NDL /NJH /NJS /NP
Set-Location $dir
node --test --test-concurrency=1 tests/admin-student-registration.browser.test.cjs   # 1ª execução = frio
node --test --test-concurrency=1 tests/admin-student-registration.browser.test.cjs   # demais = quentes
```

Pior caso: salve o preload do Apêndice A de `csp-investigation.md` fora do repo e defina, antes do comando acima, `$env:NODE_OPTIONS='--require C:/caminho/preload.cjs'` e `$env:SCTEC_DELAYS='[{"match":"^/viewer\\.js$","ms":800}]'`. O preload só age no processo cujo script principal é `server.cjs`, ou seja, no servidor que o próprio teste inicia. Limpe as duas variáveis depois. Código atual: 5 de 5 falhas. Código corrigido: deve passar.

## 7. Limites

- Amostras pequenas (8 frias, 12 quentes) em uma máquina e um navegador. Os tempos variam com a máquina; a ordem dos eventos que decide a corrida é o que importa.
- A causa da lentidão da primeira leitura de `viewer.js` em cópia nova não foi identificada (ver `csp-investigation.md`, seção 3.4).
- Só Chrome 155 foi usado. Nenhum outro navegador foi testado.
- Esta é a medição do estado atual. Não declara fidelidade ao Figma nem acessibilidade.
