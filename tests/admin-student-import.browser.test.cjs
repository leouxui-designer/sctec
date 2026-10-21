"use strict";
// Importação de estudantes: cartão de modelo, arquivo, tabela de resultados com TODAS as células editáveis,
// validação após cada edição, contadores, confirmação simulada, rolagem horizontal, mobile e CSP.
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path"), { spawn } = require("node:child_process");
const browserModule = process.env.SCTEC_PLAYWRIGHT_PATH;

const figmaWidths = [190, 144, 235, 170, 188, 166, 118, 228, 228, 228, 228, 228, 228, 92];
const headers = ["Nome", "CPF", "E-mail", "Data de Nascimento", "Link do Termo de Aceite", "Ciclo", "Turma", "Trilha 1", "Curso 1", "Trilha 2", "Curso 2", "Trilha 3", "Curso 3", "Ações"];
const csv = { name: "estudantes.csv", mimeType: "text/csv", buffer: Buffer.from("Nome,CPF,E-mail\nJoão Teste,12345678901,joao@example.com\nMaria Teste,10987654321,maria@example.com") };

async function eventually(check, message, timeout = 4000) {
  const started = Date.now();
  for (;;) {
    try { if (await check()) return; } catch { /* tenta de novo */ }
    if (Date.now() - started > timeout) assert.fail(message);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

test("Importação de estudantes: tabela editável, validação, confirmação simulada, mobile e CSP", { skip: !browserModule, timeout: 120000 }, async () => {
  const { chromium } = require(browserModule), port = 4212, base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["server.cjs"], { cwd: path.resolve(__dirname, ".."), env: { ...process.env, PORT: String(port) } });
  let browser;
  try {
    for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) break; } catch { /* servidor iniciando */ } await new Promise(resolve => setTimeout(resolve, 100)); }
    browser = await chromium.launch({ headless: true, ...(process.env.SCTEC_CHROME_PATH ? { executablePath: process.env.SCTEC_CHROME_PATH } : {}) });
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }), errors = [], violations = [], downloads = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("download", download => downloads.push(download.suggestedFilename()));
    await page.addInitScript(() => document.addEventListener("securitypolicyviolation", event => console.warn("CSP_TEST:" + event.blockedURI)));
    page.on("console", message => { if (message.text().startsWith("CSP_TEST:")) violations.push(message.text()); });
    await page.goto(base + "/viewer.html#/sctec/admin/students");
    const f = page.frameLocator("#sctec-content");

    // ---- helpers de página
    const cta = f.getByRole("button", { name: /Cadastrar Estudante/ });
    const grid = f.locator("#student-import-grid");
    const wrap = f.locator(".student-import-results__table-wrap");
    const live = f.locator("#student-import-live");
    const confirm = f.locator("#student-import-confirm");
    const cell = (record, field) => f.locator(`tr[data-record="${record}"] [data-field="${field}"]`);
    const control = f.locator(".student-import-cell__control");
    const errorCount = async () => Number(await f.locator("#student-import-errors").innerText());
    const active = () => f.locator("body").evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, field: el.dataset.field ?? el.closest("[data-field]")?.dataset.field ?? null, record: el.closest("tr")?.dataset.record ?? null, isControl: el.classList.contains("student-import-cell__control"), rowEdit: el.dataset.rowEdit ?? null, inGrid: !!el.closest("#student-import-grid") };
    });
    const layout = () => grid.evaluate(table => ({
      heads: [...table.tHead.rows[0].cells].map(c => Math.round(c.getBoundingClientRect().width)),
      rows: [...table.tBodies[0].rows].map(r => Math.round(r.getBoundingClientRect().height)),
      width: Math.round(table.getBoundingClientRect().width)
    }));
    const editCell = async (record, field, value, key = "Enter") => {
      await cell(record, field).click();
      await control.waitFor();
      if (value !== undefined) {
        if (await control.evaluate(el => el.tagName) === "SELECT") await control.selectOption(value);
        else await control.fill(value);
      }
      if (key) await control.press(key);
    };
    const openResults = async () => {
      await cta.click();
      await f.getByRole("button", { name: /Via Planilha/ }).click();
      await f.getByRole("button", { name: /Já tenho o arquivo/ }).click();
      await f.locator("#student-import-file").setInputFiles(csv);
      await f.locator("#student-import-review").click();
      await f.locator("#student-import-submit").click();
      await grid.waitFor();
    };

    // ---- 1. Cartão "Baixar Modelo de Importação": hover verde sutil, transição, cursor, foco, sem aviso amarelo
    await cta.click();
    await f.getByRole("button", { name: /Via Planilha/ }).click();
    const card = f.locator("#student-import-template-download");
    await card.waitFor();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    const rest = await card.evaluate(el => { const s = getComputedStyle(el); return { border: s.borderTopColor, background: s.backgroundColor, cursor: s.cursor, transition: s.transitionProperty, duration: s.transitionDuration }; });
    assert.equal(rest.border, "rgb(212, 212, 212)");
    assert.equal(rest.cursor, "pointer");
    assert.match(rest.transition, /border-color/);
    assert.match(rest.transition, /background-color/);
    assert.notEqual(rest.duration.split(",")[0].trim(), "0s");
    await card.hover();
    await page.waitForTimeout(350);
    const hovered = await card.evaluate(el => { const s = getComputedStyle(el); return { border: s.borderTopColor, background: s.backgroundColor }; });
    assert.equal(hovered.border, "rgb(102, 158, 46)");
    assert.notEqual(hovered.background, rest.background);
    await page.mouse.move(2, 2);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const focusRing = await card.evaluate(el => { const s = getComputedStyle(el); return { active: document.activeElement === el, width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor }; });
    assert.deepEqual(focusRing, { active: true, width: "3px", style: "solid", color: "rgb(122, 185, 52)" });
    assert.equal(await card.getAttribute("aria-disabled"), "true");
    assert.equal(await f.locator(".student-registration-method__notice").count(), 0);
    assert.equal(await f.getByText("Modelo aprovado não encontrado neste protótipo.", { exact: false }).count(), 0);
    assert.equal(await f.locator("#student-import-template-status").innerText(), "");
    await card.click({ force: true });
    await eventually(async () => /Modelo oficial indisponível neste protótipo\. Nenhum arquivo foi baixado\./.test(await f.locator("#student-import-template-status").innerText()), "o cartão deve explicar que o modelo não está disponível");
    assert.deepEqual(downloads, []);
    assert.equal(await f.getByText(/baixado com sucesso|modelo baixado/i).count(), 0);

    // ---- 2. Arquivo selecionado: nome, tamanho, lixeira "Remover arquivo", remoção e nova seleção
    await f.getByRole("button", { name: /Já tenho o arquivo/ }).click();
    await f.locator("#student-import-file").setInputFiles({ name: "estudantes.txt", mimeType: "text/plain", buffer: Buffer.from("teste") });
    assert.match(await f.locator("#student-import-file-error").innerText(), /\.xlsx, \.xls ou \.csv/);
    await f.locator("#student-import-file").setInputFiles(csv);
    assert.match(await f.locator("#student-import-file-summary").innerText(), /estudantes\.csv/);
    assert.match(await f.locator("#student-import-file-size").innerText(), /\d+ (B|KB)/);
    assert.equal(await f.getByText("Substituir", { exact: true }).count(), 0);
    const remove = f.getByRole("button", { name: "Remover arquivo" });
    assert.equal(await remove.count(), 1);
    assert.equal(await remove.innerText(), "");
    await remove.click();
    assert.equal(await f.locator("#student-import-file-summary").isVisible(), false);
    assert.equal(await f.locator("#student-import-review").isDisabled(), true);
    await f.locator("#student-import-file").setInputFiles(csv);
    assert.equal(await f.locator("#student-import-review").isEnabled(), true);

    // ---- 3. Transição para os resultados: tabela completa do Figma, 8 registros, 1 erro, Confirmar desabilitado
    await f.locator("#student-import-review").click();
    await f.locator("#student-import-submit").click();
    await grid.waitFor();
    assert.equal(await grid.getAttribute("role"), "grid");
    assert.equal(await grid.getAttribute("aria-rowcount"), "9");
    assert.match(await f.locator("#student-import-results-notice").innerText(), /fictícios/);
    assert.deepEqual(await grid.evaluate(table => [...table.tHead.rows[0].cells].map(c => c.textContent.replace(/\s+/g, " ").trim())), headers);
    const initial = await layout();
    assert.equal(initial.rows.length, 6);
    initial.heads.forEach((width, index) => assert.ok(Math.abs(width - figmaWidths[index]) <= 1, `coluna ${index + 1}: ${width}px, esperado ${figmaWidths[index]}px`));
    assert.ok(initial.rows.every(height => height === 65), `altura das linhas: ${initial.rows}`);
    assert.equal(await f.locator("#student-import-table-body tr:first-child > *").count(), 14);
    assert.equal(await f.locator("#student-import-table-body tr:first-child th[scope=row]").count(), 1);
    assert.equal(await f.locator("#student-import-total").innerText(), "8");
    assert.equal(await errorCount(), 1);
    assert.equal(await confirm.isDisabled(), true);
    // Dados do Figma nas colunas além do quadro visível (Turma, Trilha/Curso e Ações).
    assert.equal(await cell("r1", "classroom").innerText(), "Carreira Tech");
    assert.equal(await cell("r1", "track2").innerText(), "Análise de Dados");
    assert.equal(await cell("r1", "course3").innerText(), "Machine Learning e Visão Computacional");
    assert.equal(await f.locator("[data-row-edit]").count(), 6);
    // Rolagem horizontal dentro do cartão, sem estourar a página.
    const scroll = await wrap.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    assert.ok(scroll.scrollWidth >= 2671 && scroll.scrollWidth > scroll.clientWidth + 1000, JSON.stringify(scroll));
    assert.equal(await f.locator("body").evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    // O erro do e-mail é identificável sem depender só da cor: ícone, aria-invalid e descrição associada.
    const emailError = cell("r3", "email");
    assert.equal(await emailError.getAttribute("aria-invalid"), "true");
    assert.equal(await emailError.locator("img.student-import-cell__icon").count(), 1);
    const describedBy = await emailError.getAttribute("aria-describedby");
    assert.equal(await f.locator(`#${describedBy}`).textContent(), "Informe um e-mail válido.");
    assert.equal(await f.locator(`#${describedBy}`).isVisible(), false);
    await emailError.hover();
    assert.equal(await f.locator(`#${describedBy}`).isVisible(), true);
    await page.mouse.move(2, 2);

    // ---- 4. Edição de célula VÁLIDA por clique: controle no lugar, layout preservado, Enter confirma e devolve o foco
    const valid = cell("r1", "name");
    await valid.hover();
    await page.waitForTimeout(250);
    assert.equal(await valid.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(246, 250, 241)");
    await valid.click();
    assert.equal(await control.count(), 1);
    assert.equal(await control.getAttribute("aria-label"), "Editar Nome de João Silva");
    assert.equal(await control.inputValue(), "João Silva");
    assert.equal((await active()).isControl, true);
    assert.deepEqual(await layout(), initial);
    await control.fill("João Pedro Silva");
    await control.press("Enter");
    assert.equal(await control.count(), 0);
    assert.equal(await valid.innerText(), "João Pedro Silva");
    assert.deepEqual(await active(), { tag: "TH", field: "name", record: "r1", isControl: false, rowEdit: null, inGrid: true });
    assert.equal(await f.locator('[data-row-edit="r1"]').getAttribute("aria-label"), "Editar registro de João Pedro Silva");
    await eventually(async () => /Nome de João Pedro Silva atualizado/.test(await live.textContent()), "a atualização deve ser anunciada");
    assert.equal(await errorCount(), 1);

    // ---- 5. Escape cancela a edição em andamento
    await cell("r1", "cpf").click();
    await control.fill("999");
    await control.press("Escape");
    assert.equal(await control.count(), 0);
    assert.equal(await cell("r1", "cpf").innerText(), "012.345.678-90");
    assert.equal((await active()).field, "cpf");

    // ---- 6. Blur confirma sem perder o valor (clicar em outra célula e sair com Tab)
    await cell("r4", "cycle").click();
    await control.fill("2025 - 1º Semestre");
    await cell("r4", "classroom").click();
    assert.equal(await cell("r4", "cycle").innerText(), "2025 - 1º Semestre");
    assert.equal(await control.getAttribute("aria-label"), "Editar Turma de Ana Beatriz Costa");
    await control.fill("Carreira Tech 2");
    await control.press("Tab");
    assert.equal(await control.count(), 0);
    assert.equal(await cell("r4", "classroom").innerText(), "Carreira Tech 2");
    assert.equal((await active()).inGrid, false, "Tab deve sair da tabela (sem armadilha de teclado)");
    assert.equal(await errorCount(), 1);

    // ---- 7. Novos erros em células antes válidas, inclusive dependência Trilha → Curso
    await editCell("r4", "cpf", "123");
    assert.equal(await cell("r4", "cpf").getAttribute("aria-invalid"), "true");
    assert.equal(await f.locator(`#${await cell("r4", "cpf").getAttribute("aria-describedby")}`).textContent(), "Informe um CPF com 11 dígitos.");
    assert.equal(await errorCount(), 2);
    assert.equal(await confirm.isDisabled(), true);
    await editCell("r6", "name", "");
    assert.equal(await f.locator(`#${await cell("r6", "name").getAttribute("aria-describedby")}`).textContent(), "Preencha este campo obrigatório.");
    assert.equal(await errorCount(), 3);
    await cell("r5", "track1").click();
    assert.equal(await control.evaluate(el => el.tagName), "SELECT");
    await control.selectOption("Análise de Dados");
    await control.press("Enter");
    assert.equal(await cell("r5", "track1").getAttribute("aria-invalid"), null, "a trilha escolhida é válida");
    assert.equal(await cell("r5", "course1").getAttribute("aria-invalid"), "true", "o curso deve ser revalidado quando a trilha muda");
    assert.equal(await f.locator(`#${await cell("r5", "course1").getAttribute("aria-describedby")}`).textContent(), "O curso não pertence à trilha selecionada.");
    assert.equal(await errorCount(), 4);
    assert.equal(await f.locator("button", { hasText: /^Com erro/ }).innerText().then(text => text.replace(/\s+/g, " ")), "Com erro 4");
    await eventually(async () => /4 registros com erro/.test(await live.textContent()), "o total de erros deve ser anunciado");
    // Data de nascimento futura e link inválido (página 2).
    await f.getByRole("button", { name: "Página 2", exact: true }).click();
    assert.equal(await f.locator("#student-import-table-body tr").count(), 2);
    assert.equal((await active()).tag, "BUTTON", "o foco permanece na paginação após renderizar");
    await editCell("r7", "birth", "2099-01-01");
    assert.equal(await f.locator(`#${await cell("r7", "birth").getAttribute("aria-describedby")}`).textContent(), "Informe uma data de nascimento válida.");
    await editCell("r8", "term", "abc");
    assert.equal(await f.locator(`#${await cell("r8", "term").getAttribute("aria-describedby")}`).textContent(), "Informe um link válido, iniciado por http:// ou https://.");
    assert.equal(await errorCount(), 6);
    await editCell("r8", "term", "https://forms.gle/exemplo");
    await editCell("r7", "birth", "2012-02-09");
    assert.equal(await cell("r7", "birth").innerText(), "09/02/2012");
    assert.equal(await errorCount(), 4);
    await f.getByRole("button", { name: "Página 1", exact: true }).click();
    assert.equal(await cell("r1", "name").innerText(), "João Pedro Silva", "edições persistem ao trocar de página");

    // ---- 8. Aba "Com erro": a lista é fixada ao escolher a aba; corrigir não faz a linha sumir durante a edição
    await f.getByRole("button", { name: /^Com erro/ }).click();
    assert.equal(await f.locator("#student-import-table-body tr").count(), 4);
    await editCell("r3", "email", "pedro.rodrigues@email.com");
    assert.equal(await cell("r3", "email").getAttribute("aria-invalid"), null);
    assert.equal(await errorCount(), 3);
    assert.equal(await f.locator("#student-import-table-body tr").count(), 4, "a linha corrigida permanece até trocar de aba");
    await f.getByRole("button", { name: /^Todos/ }).click();
    await f.getByRole("button", { name: /^Com erro/ }).click();
    assert.equal(await f.locator("#student-import-table-body tr").count(), 3);
    await f.getByRole("button", { name: /^Todos/ }).click();

    // ---- 9. Teclado: roving tabindex, setas, Home/End, Ctrl+Home/End, Enter/F2, lápis da linha
    assert.equal(await f.locator('#student-import-table-body [tabindex="0"]').count(), 1);
    await cell("r1", "name").focus();
    await page.keyboard.press("ArrowRight");
    assert.deepEqual([(await active()).record, (await active()).field], ["r1", "cpf"]);
    await page.keyboard.press("ArrowDown");
    assert.deepEqual([(await active()).record, (await active()).field], ["r2", "cpf"]);
    await page.keyboard.press("End");
    assert.equal((await active()).rowEdit, "r2");
    await page.keyboard.press("Home");
    assert.deepEqual([(await active()).record, (await active()).field], ["r2", "name"]);
    await page.keyboard.press("Control+End");
    assert.equal((await active()).rowEdit, "r6");
    await page.keyboard.press("Control+Home");
    assert.deepEqual([(await active()).record, (await active()).field], ["r1", "name"]);
    await page.keyboard.press("ArrowUp");
    assert.deepEqual([(await active()).record, (await active()).field], ["r1", "name"]);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    assert.equal((await active()).isControl, true);
    assert.equal(await control.getAttribute("aria-label"), "Editar E-mail de João Pedro Silva");
    await control.fill("joao.pedro@email.com");
    await page.keyboard.press("Enter");
    assert.equal(await cell("r1", "email").innerText(), "joao.pedro@email.com");
    assert.deepEqual([(await active()).record, (await active()).field, (await active()).isControl], ["r1", "email", false]);
    await page.keyboard.press("F2");
    await control.press("Escape");
    assert.equal(await cell("r1", "email").innerText(), "joao.pedro@email.com");
    await cell("r2", "name").focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    assert.deepEqual([(await active()).record, (await active()).field, (await active()).isControl], ["r2", "name", true], "o lápis abre a edição da primeira célula da linha");
    await control.press("Escape");
    // Selects: Escape descarta a escolha ainda não confirmada.
    await cell("r2", "track3").focus();
    await page.keyboard.press("Enter");
    await control.selectOption("Análise de Dados");
    await control.press("Escape");
    assert.equal(await cell("r2", "track3").innerText(), "Inteligência Artificial");

    // ---- 10. Corrigir tudo: contador em zero, Confirmar habilitado; reintroduzir erro o desabilita de novo
    await editCell("r4", "cpf", "12345678901");
    assert.equal(await cell("r4", "cpf").innerText(), "123.456.789-01", "CPF é formatado ao confirmar");
    await editCell("r6", "name", "Camila de Souza");
    assert.equal(await errorCount(), 1);
    assert.equal(await confirm.isDisabled(), true);
    await editCell("r5", "course1", "Análise de Dados com Python");
    assert.equal(await cell("r5", "course1").getAttribute("aria-invalid"), null);
    assert.equal(await errorCount(), 0);
    assert.equal(await confirm.isEnabled(), true);
    assert.equal(await confirm.getAttribute("title"), null);
    await eventually(async () => /Nenhum registro com erro\. Confirmação habilitada\./.test(await live.textContent()), "a habilitação deve ser anunciada");
    await editCell("r2", "email", "maria.fernandes.email.com");
    assert.equal(await errorCount(), 1);
    assert.equal(await confirm.isDisabled(), true);
    await editCell("r2", "email", "maria.fernandes@email.com");
    assert.equal(await errorCount(), 0);
    assert.equal(await confirm.isEnabled(), true);

    // ---- 11. Coluna Ações e rolagem horizontal: o lápis é alcançável e abre a edição da linha
    await wrap.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    const pencil = f.locator('[data-row-edit="r1"]');
    assert.equal(await pencil.isVisible(), true);
    assert.equal(await pencil.getAttribute("title"), "Editar");
    await pencil.click();
    assert.deepEqual([(await active()).record, (await active()).field, (await active()).isControl], ["r1", "name", true]);
    assert.ok(await wrap.evaluate(el => el.scrollLeft) < 100, "o foco volta a mostrar a primeira coluna");
    await control.press("Escape");

    // ---- 12. Confirmação simulada: diálogo de sucesso, listagem intacta, navegação preservada
    await confirm.click();
    const success = f.locator("#student-import-success");
    assert.equal(await success.isVisible(), true);
    assert.match(await success.innerText(), /Simulação concluída: 8 registros fictícios/);
    assert.match(await success.innerText(), /Nenhum estudante foi criado/);
    await success.getByRole("button", { name: "Voltar para Banco de Talentos" }).click();
    assert.equal(await f.locator("#student-import-results").isVisible(), false);
    assert.equal(page.url(), base + "/viewer.html#/sctec/admin/students");
    assert.equal(await cta.evaluate(el => el === document.activeElement), true);
    assert.equal(await f.locator("#student-result-count").innerText(), "Exibindo 14 estudantes");
    assert.equal(await f.locator("#student-table-body").getByText("João Pedro Silva").count(), 0, "o Banco de Talentos não é alterado");
    assert.match(await f.locator('[data-student-row="joao"]').innerText(), /João Silva/);
    // Nova importação recomeça do cenário inicial (8 registros, 1 erro).
    await openResults();
    assert.equal(await errorCount(), 1);
    assert.equal(await confirm.isDisabled(), true);
    assert.equal(await cell("r1", "name").innerText(), "João Silva");
    await f.locator("#student-import-cancel").click();
    assert.equal(await f.locator("#student-import-results").isVisible(), false);

    // ---- 13. Mobile (390 px): sem overflow da página, tabela rolável, edição visível, diálogo de sucesso cabe na tela
    await page.setViewportSize({ width: 390, height: 844 });
    await openResults();
    assert.equal(await f.locator("body").evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    const mobile = await wrap.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    assert.ok(mobile.scrollWidth > mobile.clientWidth + 1000, JSON.stringify(mobile));
    await cell("r3", "email").click();
    const box = await control.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 390, `controle fora da tela: ${JSON.stringify(box)}`);
    assert.equal((await active()).isControl, true);
    await control.fill("pedro.rodrigues@email.com");
    await control.press("Enter");
    assert.equal(await errorCount(), 0);
    await confirm.click();
    const dialogBox = await success.boundingBox();
    assert.ok(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= 390);
    await success.getByRole("button", { name: "Voltar para Banco de Talentos" }).click();

    // ---- 14. Sem erros de JavaScript nem violações de CSP
    assert.deepEqual(errors, []);
    assert.deepEqual(violations, []);
  } finally { await browser?.close(); server.kill(); }
});
