"use strict";
/*
  Importação de estudantes: tela de resultados (Figma 101248:19004, tabela 101949:25355).

  - Dados fictícios e determinísticos (8 estudantes, 1 e-mail inválido). Nada é lido do arquivo enviado,
    nada é salvo e nenhuma conta é criada. A lista do Banco de Talentos não é alterada.
  - Toda célula de dado é editável no próprio local (clique, Enter ou F2). Enter confirma, Esc cancela e
    sair da célula (blur) também confirma. Setas, Home, End e Ctrl+Home/End navegam entre as células.
  - Após cada edição confirmada, o registro inteiro é revalidado (inclusive dependências entre campos,
    como Trilha e Curso), os contadores são recalculados e "Confirmar importação" é habilitado ou não.
  - Abertura e fechamento são coordenados com admin-student-registration-method.js por eventos do DOM:
    "student-import:open" (detail.fileName) e "student-import:close".
*/
(() => {
  const results = document.getElementById("student-import-results");
  const notice = document.getElementById("student-import-results-notice");
  const grid = document.getElementById("student-import-grid");
  const wrap = results.querySelector(".student-import-results__table-wrap");
  const body = document.getElementById("student-import-table-body");
  const empty = document.getElementById("student-import-results-empty");
  const pagination = document.getElementById("student-import-results-pagination");
  const totalBadge = document.getElementById("student-import-total");
  const errorsBadge = document.getElementById("student-import-errors");
  const tabs = [...results.querySelectorAll("[data-import-filter]")];
  const confirmButton = document.getElementById("student-import-confirm");
  const confirmHelp = document.getElementById("student-import-confirm-help");
  const live = document.getElementById("student-import-live");
  const success = document.getElementById("student-import-success");
  const successText = document.getElementById("student-import-success-description");

  const pageSize = 6;
  const required = "Preencha este campo obrigatório.";

  // Mesmo catálogo de trilhas e cursos do cadastro manual (pages/admin-aluno-cadastro.html).
  const catalog = [
    {track: "Desenvolvimento de Software", courses: ["Desenvolvedor Back-End Node", "Desenvolvedor Back-End Spring", "Desenvolvedor Back-End .NET", "Desenvolvedor Front-End React", "Desenvolvedor Front-End Angular", "Desenvolvedor Front-End Vue", "Desenvolvedor Mobile React Native"]},
    {track: "Análise de Dados", courses: ["Análise de Dados com Python", "Visualização de Dados e Business Intelligence"]},
    {track: "Inteligência Artificial", courses: ["Desenvolvimento de IA para Análise Preditiva", "Machine Learning e Visão Computacional"]}
  ];
  const coursesOf = track => catalog.find(item => item.track === track)?.courses ?? [];

  // Colunas de dado do Figma, na ordem da tabela. "Ações" não é campo de dado e não é editável como texto.
  const columns = [
    {key: "name", label: "Nome", kind: "text", rowHeader: true},
    {key: "cpf", label: "CPF", kind: "cpf"},
    {key: "email", label: "E-mail", kind: "email"},
    {key: "birth", label: "Data de Nascimento", kind: "date"},
    {key: "term", label: "Link do Termo de Aceite", kind: "url"},
    {key: "cycle", label: "Ciclo", kind: "text"},
    {key: "classroom", label: "Turma", kind: "text"},
    {key: "track1", label: "Trilha 1", kind: "track", pair: 1},
    {key: "course1", label: "Curso 1", kind: "course", pair: 1},
    {key: "track2", label: "Trilha 2", kind: "track", pair: 2},
    {key: "course2", label: "Curso 2", kind: "course", pair: 2},
    {key: "track3", label: "Trilha 3", kind: "track", pair: 3},
    {key: "course3", label: "Curso 3", kind: "course", pair: 3}
  ];
  const columnByKey = new Map(columns.map(column => [column.key, column]));

  // Registros fictícios (nomes, CPFs e datas do Figma; as duas últimas linhas existiam no protótipo anterior).
  const seed = [
    {name: "João Silva", cpf: "012.345.678-90", email: "joao.silva@email.com", birth: "2012-03-15", term: ""},
    {name: "Maria Luísa Fernandes", cpf: "234.567.890-12", email: "maria.fernandes@email.com", birth: "2011-07-22", term: "https://forms.gle/termoSCTECJoaoSilva"},
    {name: "Pedro Rodrigues", cpf: "234.567.890-12", email: "pedro.rodriguesemail.com", birth: "2013-11-05", term: ""},
    {name: "Ana Beatriz Costa", cpf: "678.901.234-56", email: "ana.costa@email.com", birth: "2014-01-30", term: ""},
    {name: "Lucas Martins", cpf: "789.012.345-67", email: "lucas.martins@email.com", birth: "2010-09-18", term: ""},
    {name: "Camila de Souza", cpf: "890.123.456-78", email: "camila.souza@email.com", birth: "2015-05-27", term: ""},
    {name: "Rafael Nunes", cpf: "901.234.567-89", email: "rafael.nunes@example.com", birth: "2012-02-09", term: ""},
    {name: "Beatriz Lima", cpf: "123.456.789-01", email: "beatriz.lima@example.com", birth: "2011-08-11", term: ""}
  ];
  const seedAcademic = {
    cycle: "2024 - 2º Semestre",
    classroom: "Carreira Tech",
    track1: "Desenvolvimento de Software", course1: "Desenvolvedor Back-End Node",
    track2: "Análise de Dados", course2: "Visualização de Dados e Business Intelligence",
    track3: "Inteligência Artificial", course3: "Machine Learning e Visão Computacional"
  };

  const emailProbe = document.createElement("input");
  emailProbe.type = "email";

  let records = [];
  let filter = "all";
  let page = 1;
  let visibleIds = [];
  let editing = null;
  let activeKey = null;
  let liveTimer;
  let fileName = "";

  // ---------------------------------------------------------------- validação

  function todayIso() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function isValidIsoDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function isHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  /*
    Regras aplicadas (as mesmas do cadastro manual, em js/admin-student-registration.js):
    campos obrigatórios; nome com 3+ caracteres; CPF com 11 dígitos (sem dígito verificador); e-mail válido pela
    validação nativa do navegador; data de nascimento válida e não futura; pelo menos um curso concluído.
    Trilha e Curso: cada curso deve pertencer à trilha da mesma dupla. O link do termo é opcional e, se
    preenchido, precisa ser http(s) (validação de formato). A regra "menor de 18 anos só com Jovem Aprendiz" do
    cadastro manual NÃO é aplicada aqui: todos os exemplos do Figma são menores com ciclo "2024 - 2º Semestre"
    e a origem dessa regra no Figma não foi verificada.
  */
  function validate(record) {
    const errors = {};
    const text = key => String(record[key] ?? "").trim();
    if (!text("name")) errors.name = required;
    else if (text("name").length < 3) errors.name = "Informe o nome completo do estudante.";
    if (!text("cpf")) errors.cpf = required;
    else if (text("cpf").replace(/\D/g, "").length !== 11) errors.cpf = "Informe um CPF com 11 dígitos.";
    if (!text("email")) errors.email = required;
    else {
      emailProbe.value = text("email");
      if (emailProbe.validity.typeMismatch) errors.email = "Informe um e-mail válido.";
    }
    if (!text("birth")) errors.birth = required;
    else if (!isValidIsoDate(text("birth")) || text("birth") > todayIso()) errors.birth = "Informe uma data de nascimento válida.";
    if (text("term") && !isHttpUrl(text("term"))) errors.term = "Informe um link válido, iniciado por http:// ou https://.";
    if (!text("cycle")) errors.cycle = required;
    if (!text("classroom")) errors.classroom = required;
    let completePairs = 0;
    for (const pair of [1, 2, 3]) {
      const track = text(`track${pair}`);
      const course = text(`course${pair}`);
      if (!track && !course) continue;
      if (!track) errors[`track${pair}`] = "Selecione a trilha do curso.";
      else if (!course) errors[`course${pair}`] = "Selecione o curso da trilha.";
      else if (!coursesOf(track).includes(course)) errors[`course${pair}`] = "O curso não pertence à trilha selecionada.";
      else completePairs += 1;
    }
    if (!completePairs && ![1, 2, 3].some(pair => errors[`track${pair}`] || errors[`course${pair}`])) errors.course1 = "Selecione pelo menos um curso concluído.";
    return errors;
  }

  function createRecords() {
    return seed.map((item, index) => {
      const record = {id: `r${index + 1}`, ...item, ...seedAcademic};
      record.errors = validate(record);
      return record;
    });
  }

  const hasErrors = record => Object.keys(record.errors).length > 0;
  const recordById = id => records.find(record => record.id === id);
  const errorRowCount = () => records.filter(hasErrors).length;
  const countLabel = count => (count === 1 ? "1 registro com erro" : `${count} registros com erro`);

  // ---------------------------------------------------------------- valores

  function maskCpf(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function normalize(column, raw) {
    const value = String(raw ?? "");
    if (column.kind === "cpf") return maskCpf(value);
    if (column.kind === "track" || column.kind === "course" || column.kind === "date") return value;
    return value.trim();
  }

  function displayValue(record, column) {
    const value = String(record[column.key] ?? "");
    return column.kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split("-").reverse().join("/") : value;
  }

  const tipId = (record, column) => `student-import-tip-${record.id}-${column.key}`;
  const studentLabel = record => record.name.trim() || "estudante sem nome";

  // ---------------------------------------------------------------- células

  function buildTip(record, column) {
    const tip = document.createElement("span");
    tip.className = "student-import-cell__tip";
    tip.id = tipId(record, column);
    tip.setAttribute("role", "tooltip");
    tip.textContent = record.errors[column.key];
    return tip;
  }

  function buildIcon() {
    const icon = document.createElement("img");
    icon.className = "student-import-cell__icon";
    icon.src = "../assets/admin-figma/PhosphorIconsWarningCircle.svg";
    icon.alt = "";
    icon.width = 20;
    icon.height = 20;
    return icon;
  }

  /*
    Modo de exibição: valor, ícone de alerta (quando inválido) e descrição do erro.
    A atualização é feita no próprio local, reaproveitando os elementos existentes. Recriar o conteúdo da
    célula durante um clique (o blur da edição anterior repinta a linha) descartaria o alvo do mouse e o
    navegador não dispararia o "click" que inicia a edição da célula seguinte.
  */
  function paintCell(cell, record, column) {
    const message = record.errors[column.key];
    cell.classList.toggle("is-error", Boolean(message));
    if (message) {
      cell.setAttribute("aria-invalid", "true");
      cell.setAttribute("aria-describedby", tipId(record, column));
    } else {
      cell.removeAttribute("aria-invalid");
      cell.removeAttribute("aria-describedby");
    }
    cell.querySelector(":scope > .student-import-cell__editor")?.remove();
    let inner = cell.querySelector(":scope > .student-import-cell__inner");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "student-import-cell__inner";
      const value = document.createElement("span");
      value.className = "student-import-cell__value";
      inner.append(value);
      cell.prepend(inner);
    }
    inner.querySelector(".student-import-cell__value").textContent = displayValue(record, column);
    const icon = inner.querySelector(".student-import-cell__icon");
    if (message && !icon) inner.append(buildIcon());
    else if (!message && icon) icon.remove();
    const tip = cell.querySelector(":scope > .student-import-cell__tip");
    if (message && !tip) cell.append(buildTip(record, column));
    else if (message) tip.textContent = message;
    else tip?.remove();
  }

  function createCell(record, column) {
    const cell = document.createElement(column.rowHeader ? "th" : "td");
    if (column.rowHeader) cell.scope = "row";
    else cell.setAttribute("role", "gridcell");
    cell.className = "student-import-cell";
    cell.dataset.field = column.key;
    cell.tabIndex = -1;
    paintCell(cell, record, column);
    return cell;
  }

  function createActionsCell(record) {
    const cell = document.createElement("td");
    cell.className = "student-import-actions";
    cell.setAttribute("role", "gridcell");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-icon student-import-row-edit";
    button.dataset.rowEdit = record.id;
    button.tabIndex = -1;
    button.title = "Editar";
    button.setAttribute("aria-label", `Editar registro de ${studentLabel(record)}`);
    const icon = document.createElement("img");
    icon.src = "../assets/admin-figma/TablerIconsPencil.svg";
    icon.alt = "";
    icon.width = 20;
    icon.height = 20;
    button.append(icon);
    cell.append(button);
    return cell;
  }

  function createRow(record, index) {
    const row = document.createElement("tr");
    row.dataset.record = record.id;
    row.setAttribute("aria-rowindex", String(index + 2));
    row.append(...columns.map(column => createCell(record, column)), createActionsCell(record));
    return row;
  }

  function refreshRow(record) {
    const row = body.querySelector(`tr[data-record="${record.id}"]`);
    if (!row) return;
    for (const column of columns) {
      const cell = row.querySelector(`[data-field="${column.key}"]`);
      if (cell && !cell.classList.contains("is-editing")) paintCell(cell, record, column);
    }
    row.querySelector("[data-row-edit]")?.setAttribute("aria-label", `Editar registro de ${studentLabel(record)}`);
  }

  // ---------------------------------------------------------------- foco e navegação por teclado

  const focusTarget = cell => cell.querySelector("[data-row-edit]") ?? cell;
  const cellKey = cell => `${cell.parentElement.dataset.record}|${cell.dataset.field ?? "actions"}`;

  // Apenas uma célula da tabela fica na sequência de Tab (roving tabindex); as demais usam as setas.
  function setActive(cell) {
    const target = focusTarget(cell);
    body.querySelectorAll('[tabindex="0"]').forEach(element => { if (element !== target) element.tabIndex = -1; });
    target.tabIndex = 0;
    activeKey = cellKey(cell);
  }

  function focusCell(cell) {
    setActive(cell);
    focusTarget(cell).focus();
  }

  function restoreActive() {
    const rows = [...body.rows];
    if (!rows.length) { activeKey = null; return; }
    const match = rows.flatMap(row => [...row.cells]).find(cell => cellKey(cell) === activeKey);
    setActive(match ?? rows[0].cells[0]);
  }

  function moveFocus(cell, deltaRow, deltaColumn, mode) {
    const rows = [...body.rows];
    let rowIndex = rows.indexOf(cell.parentElement);
    let columnIndex = [...cell.parentElement.cells].indexOf(cell);
    if (mode === "rowStart") columnIndex = 0;
    else if (mode === "rowEnd") columnIndex = cell.parentElement.cells.length - 1;
    else if (mode === "gridStart") { rowIndex = 0; columnIndex = 0; }
    else if (mode === "gridEnd") { rowIndex = rows.length - 1; columnIndex = rows[rowIndex].cells.length - 1; }
    else { rowIndex += deltaRow; columnIndex += deltaColumn; }
    rowIndex = Math.max(0, Math.min(rows.length - 1, rowIndex));
    columnIndex = Math.max(0, Math.min(rows[rowIndex].cells.length - 1, columnIndex));
    focusCell(rows[rowIndex].cells[columnIndex]);
  }

  // ---------------------------------------------------------------- edição no local

  function fillOptions(select, record, column) {
    const add = (parent, value, label) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      parent.append(option);
    };
    add(select, "", "Selecione");
    if (column.kind === "track") {
      catalog.forEach(item => add(select, item.track, item.track));
    } else {
      const list = coursesOf(record[`track${column.pair}`]);
      if (list.length) {
        list.forEach(course => add(select, course, course));
      } else {
        for (const item of catalog) {
          const group = document.createElement("optgroup");
          group.label = item.track;
          item.courses.forEach(course => add(group, course, course));
          select.append(group);
        }
      }
    }
    const current = record[column.key];
    // Valor fora da lista (por exemplo, curso de outra trilha) continua visível até ser corrigido.
    if (current && ![...select.options].some(option => option.value === current)) add(select, current, current);
    select.value = current || "";
  }

  function createControl(record, column) {
    let control;
    if (column.kind === "track" || column.kind === "course") {
      control = document.createElement("select");
      fillOptions(control, record, column);
    } else {
      control = document.createElement("input");
      control.type = {email: "email", date: "date", url: "url"}[column.kind] ?? "text";
      control.value = record[column.key] ?? "";
      control.autocomplete = "off";
      if (column.kind === "cpf") {
        control.inputMode = "numeric";
        control.maxLength = 14;
        control.placeholder = "000.000.000-00";
        control.addEventListener("input", () => { control.value = maskCpf(control.value); });
      }
      if (column.kind === "email") control.inputMode = "email";
      if (column.kind === "url") { control.inputMode = "url"; control.placeholder = "https://"; }
      if (column.kind === "date") control.max = todayIso();
    }
    control.className = "student-import-cell__control";
    control.dataset.field = column.key;
    control.setAttribute("aria-label", `Editar ${column.label} de ${studentLabel(record)}`);
    if (record.errors[column.key]) {
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", tipId(record, column));
    }
    control.addEventListener("keydown", event => {
      if (event.key === "Enter") { event.preventDefault(); finishEdit("commit"); }
      else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finishEdit("cancel"); }
    });
    control.addEventListener("blur", () => finishEdit("commit", {restoreFocus: false}));
    return control;
  }

  function startEdit(cell) {
    const column = columnByKey.get(cell.dataset.field);
    const record = recordById(cell.parentElement.dataset.record);
    if (!column || !record || editing?.cell === cell) return;
    finishEdit("commit", {restoreFocus: false});
    const control = createControl(record, column);
    editing = {cell, record, column, control};
    setActive(cell);
    cell.classList.add("is-editing");
    const editor = document.createElement("div");
    editor.className = "student-import-cell__editor";
    editor.append(control);
    cell.replaceChildren(editor, ...(record.errors[column.key] ? [buildTip(record, column)] : []));
    control.focus();
    if (control.tagName === "INPUT" && ["text", "email", "url"].includes(control.type)) control.select();
  }

  function describeChange(record, column, before) {
    const parts = [];
    for (const item of columns) {
      const previous = before[item.key];
      const current = record.errors[item.key];
      if (current && current !== previous) parts.push(`${item.label} de ${studentLabel(record)}: ${current}`);
      else if (!current && previous) parts.push(`${item.label} de ${studentLabel(record)} corrigido`);
    }
    if (!parts.length) parts.push(`${column.label} de ${studentLabel(record)} atualizado`);
    return `${parts.join(". ")}.`;
  }

  function finishEdit(mode, {restoreFocus = true} = {}) {
    if (!editing) return;
    const {cell, record, column, control} = editing;
    editing = null;
    let announcement = "";
    cell.classList.remove("is-editing");
    if (mode === "commit") {
      const next = normalize(column, control.value);
      if (next !== String(record[column.key] ?? "")) {
        const before = record.errors;
        record[column.key] = next;
        record.errors = validate(record);
        announcement = describeChange(record, column, before);
        refreshRow(record);
      }
    }
    paintCell(cell, record, column);
    if (restoreFocus) focusCell(cell);
    updateSummary();
    if (announcement) say(`${announcement} ${summaryPhrase()}`);
  }

  // ---------------------------------------------------------------- resumo, avisos e paginação

  function summaryPhrase() {
    const count = errorRowCount();
    return count ? `${countLabel(count)}.` : "Nenhum registro com erro. Confirmação habilitada.";
  }

  function say(message) {
    clearTimeout(liveTimer);
    live.textContent = "";
    liveTimer = setTimeout(() => { live.textContent = message; }, 40);
  }

  function updateSummary() {
    const count = errorRowCount();
    totalBadge.textContent = String(records.length);
    errorsBadge.textContent = String(count);
    confirmButton.disabled = count > 0;
    if (count) confirmButton.title = "Corrija os registros com erro antes de confirmar";
    else confirmButton.removeAttribute("title");
    confirmHelp.textContent = count ? `${countLabel(count)}. Corrija antes de confirmar.` : "Nenhum registro com erro. A confirmação está habilitada.";
  }

  function pageButton(target, label, content, disabled, extraClass) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pagination__btn ${extraClass}`.trim();
    button.dataset.page = String(target);
    button.disabled = disabled;
    if (label) button.setAttribute("aria-label", label);
    button.append(content);
    return button;
  }

  function chevron(direction) {
    const icon = document.createElement("img");
    icon.src = `../assets/admin-figma/LucideIconsChevron${direction}.svg`;
    icon.alt = "";
    icon.width = 16;
    icon.height = 16;
    return icon;
  }

  function renderPagination(pages) {
    pagination.replaceChildren();
    pagination.hidden = pages <= 1;
    if (pages <= 1) return;
    pagination.append(pageButton(page - 1, "Página anterior", chevron("Left"), page === 1, "pagination__btn--arrow"));
    for (let number = 1; number <= pages; number += 1) {
      const button = pageButton(number, "", document.createTextNode(String(number)), false, number === page ? "pagination__btn--active" : "");
      button.setAttribute("aria-label", `Página ${number}`);
      button.setAttribute("aria-current", number === page ? "page" : "false");
      pagination.append(button);
    }
    const info = document.createElement("span");
    info.className = "pagination__info";
    info.textContent = `de ${pages}`;
    pagination.append(info, pageButton(page + 1, "Próxima página", chevron("Right"), page === pages, "pagination__btn--arrow"));
  }

  // Os registros exibidos são fixados ao escolher a aba ou a página: corrigir um erro não faz a linha
  // sumir durante a edição. Os contadores, porém, são atualizados na hora.
  function computeVisible() {
    return (filter === "errors" ? records.filter(hasErrors) : records).map(record => record.id);
  }

  function render() {
    const pages = Math.max(1, Math.ceil(visibleIds.length / pageSize));
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize;
    const shown = visibleIds.slice(start, start + pageSize).map(recordById);
    body.replaceChildren(...shown.map((record, index) => createRow(record, start + index)));
    grid.setAttribute("aria-rowcount", String(visibleIds.length + 1));
    empty.textContent = filter === "errors" ? "Nenhum registro com erro." : "Nenhum registro importado.";
    empty.hidden = shown.length > 0;
    wrap.hidden = shown.length === 0;
    renderPagination(pages);
    restoreActive();
  }

  // ---------------------------------------------------------------- eventos

  function requestClose() {
    results.dispatchEvent(new CustomEvent("student-import:close"));
  }

  results.addEventListener("student-import:open", event => {
    fileName = event.detail?.fileName ?? "";
    records = createRecords();
    filter = "all";
    page = 1;
    editing = null;
    activeKey = null;
    tabs.forEach(tab => tab.setAttribute("aria-pressed", String(tab.dataset.importFilter === "all")));
    visibleIds = computeVisible();
    notice.textContent = `Demonstração: os ${records.length} registros abaixo são fictícios e não foram extraídos de ${fileName || "arquivo"}. Clique em uma célula para editar; as alterações não são salvas e nenhum estudante é criado.`;
    live.textContent = "";
    render();
    updateSummary();
  });

  tabs.forEach(tab => tab.addEventListener("click", () => {
    filter = tab.dataset.importFilter;
    tabs.forEach(item => item.setAttribute("aria-pressed", String(item === tab)));
    page = 1;
    visibleIds = computeVisible();
    render();
  }));

  pagination.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    page = Number(button.dataset.page);
    render();
    pagination.querySelector('[aria-current="page"]')?.focus();
  });

  body.addEventListener("click", event => {
    const rowButton = event.target.closest("[data-row-edit]");
    if (rowButton) { startEdit(rowButton.closest("tr").cells[0]); return; }
    const cell = event.target.closest(".student-import-cell");
    if (cell && !cell.classList.contains("is-editing")) startEdit(cell);
  });

  body.addEventListener("focusin", event => {
    const cell = event.target.closest("td, th");
    if (cell && body.contains(cell)) setActive(cell);
  });

  body.addEventListener("keydown", event => {
    if (editing && event.target === editing.control) return;
    const cell = event.target.closest("td, th");
    if (!cell || !body.contains(cell)) return;
    const onButton = event.target.matches("[data-row-edit]");
    switch (event.key) {
      case "ArrowRight": moveFocus(cell, 0, 1); break;
      case "ArrowLeft": moveFocus(cell, 0, -1); break;
      case "ArrowDown": moveFocus(cell, 1, 0); break;
      case "ArrowUp": moveFocus(cell, -1, 0); break;
      case "Home": moveFocus(cell, 0, 0, event.ctrlKey ? "gridStart" : "rowStart"); break;
      case "End": moveFocus(cell, 0, 0, event.ctrlKey ? "gridEnd" : "rowEnd"); break;
      case "Enter":
      case "F2":
        if (onButton || !cell.classList.contains("student-import-cell")) return;
        startEdit(cell);
        break;
      default: return;
    }
    event.preventDefault();
  });

  document.getElementById("student-import-results-back").addEventListener("click", requestClose);
  document.getElementById("student-import-cancel").addEventListener("click", requestClose);

  confirmButton.addEventListener("click", () => {
    if (confirmButton.disabled || errorRowCount() > 0) return;
    successText.textContent = `Simulação concluída: ${records.length} registros fictícios foram revisados. Nenhum estudante foi criado, nenhum e-mail foi enviado e a lista do Banco de Talentos não foi alterada.`;
    success.showModal();
    document.getElementById("student-import-success-return").focus();
  });

  function leaveSuccess() {
    success.close();
    requestClose();
  }
  document.getElementById("student-import-success-return").addEventListener("click", leaveSuccess);
  success.addEventListener("cancel", event => { event.preventDefault(); leaveSuccess(); });
})();
