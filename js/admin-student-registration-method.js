"use strict";
(() => {
  const opener = document.getElementById("student-registration-open");
  const dialog = document.getElementById("student-registration-method");
  const closeButton = dialog.querySelector("[data-close-registration-method]");
  const title = document.getElementById("student-registration-method-title");
  const panels = [...dialog.querySelectorAll("[data-import-panel]")];
  const importButton = document.getElementById("student-registration-import");
  const input = document.getElementById("student-import-file");
  const dropzone = document.getElementById("student-import-dropzone");
  const summary = document.getElementById("student-import-file-summary");
  const fileName = document.getElementById("student-import-file-name");
  const fileSize = document.getElementById("student-import-file-size");
  const fileError = document.getElementById("student-import-file-error");
  const reviewButton = document.getElementById("student-import-review");
  const submitButton = document.getElementById("student-import-submit");
  const results = document.getElementById("student-import-results");
  const templateDownload = document.getElementById("student-import-template-download");
  const templateStatus = document.getElementById("student-import-template-status");
  const main = document.querySelector(".admin-students__main");
  const allowedExtensions = new Set(["csv", "xlsx", "xls"]);
  let selectedFile = null;
  let analysis = null;

  function humanSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".0", "")} MB`;
  }

  function showPanel(name, focus = true) {
    panels.forEach(panel => { panel.hidden = panel.dataset.importPanel !== name; });
    templateStatus.textContent = "";
    title.textContent = name === "method" ? "Como você deseja cadastrar?" : "Importar via Planilha";
    dialog.classList.toggle("student-registration-method--import", name !== "method");
    if (!focus) return;
    dialog.querySelector(`[data-import-panel="${name}"] button:not(:disabled), [data-import-panel="${name}"] a[href], [data-import-panel="${name}"] input`)?.focus();
  }

  function openDialog() { showPanel("method", false); dialog.showModal(); closeButton.focus(); }
  function closeDialog() { dialog.close(); opener.focus(); }

  function parseCsvLine(line, separator) {
    const values = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
        else quoted = !quoted;
      } else if (character === separator && !quoted) { values.push(value.trim()); value = ""; }
      else value += character;
    }
    values.push(value.trim());
    return values;
  }

  function parseCsv(text) {
    const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
    if (!normalized) throw new Error("O arquivo CSV está vazio.");
    const lines = normalized.split("\n").filter(line => line.trim());
    if (lines.length < 2) throw new Error("O CSV precisa conter um cabeçalho e pelo menos um registro.");
    const first = lines[0];
    const separator = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : ",";
    const headers = parseCsvLine(first, separator);
    if (headers.length < 2 || headers.some(header => !header)) throw new Error("O cabeçalho do CSV está incompleto.");
    const rows = lines.slice(1).map((line, index) => ({line: index + 2, values: parseCsvLine(line, separator)}));
    const invalid = rows.filter(row => row.values.length !== headers.length);
    if (invalid.length) throw new Error(`A linha ${invalid[0].line} possui ${invalid[0].values.length} campos; eram esperados ${headers.length}.`);
    return {supported: true, headers, rows, errors: []};
  }

  async function inspectFile(file) {
    const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    if (!allowedExtensions.has(extension)) throw new Error("Selecione um arquivo .xlsx, .xls ou .csv.");
    if (file.size === 0) throw new Error("O arquivo selecionado está vazio.");
    if (extension === "csv") return parseCsv(await file.text());
    return {supported: false, headers: [], rows: [], errors: []};
  }

  function clearFile() {
    selectedFile = null;
    analysis = null;
    input.value = "";
    summary.hidden = true;
    dropzone.hidden = false;
    fileError.hidden = true;
    reviewButton.disabled = true;
  }

  async function selectFile(file) {
    fileError.hidden = true;
    reviewButton.disabled = true;
    try {
      analysis = await inspectFile(file);
      selectedFile = file;
      fileName.textContent = file.name;
      fileSize.textContent = humanSize(file.size);
      summary.hidden = false;
      dropzone.hidden = true;
      reviewButton.disabled = false;
    } catch (error) {
      clearFile();
      fileError.textContent = error.message;
      fileError.hidden = false;
      input.focus();
    }
  }

  function showReview() {
    if (!selectedFile || !analysis) return;
    document.getElementById("student-import-review-file").textContent = `${selectedFile.name} · ${humanSize(selectedFile.size)}`;
    const reviewTitle = document.getElementById("student-import-review-title");
    const reviewNote = document.getElementById("student-import-review-note");
    reviewTitle.textContent = "Arquivo selecionado";
    reviewNote.textContent = "Arquivo validado para esta demonstração. A próxima etapa usa dados fictícios e não representa o conteúdo do arquivo.";
    submitButton.textContent = "Importar Estudantes";
    showPanel("review");
  }

  // A tela de resultados (tabela editável, validação e confirmação simulada) vive em
  // admin-student-import-results.js. Este arquivo só a abre e fecha por eventos do DOM.
  function openResults() {
    if (!selectedFile || !analysis) return;
    dialog.close();
    main.classList.add("is-import-results");
    results.hidden = false;
    results.dispatchEvent(new CustomEvent("student-import:open", {detail: {fileName: selectedFile.name}}));
    document.getElementById("student-import-results-back").focus();
    window.scrollTo({top: 0});
  }

  function closeResults() {
    results.hidden = true;
    main.classList.remove("is-import-results");
    opener.focus();
  }

  opener.addEventListener("click", openDialog);
  closeButton.addEventListener("click", closeDialog);
  importButton.addEventListener("click", () => showPanel("template"));
  // O modelo oficial não existe neste protótipo: o clique nunca baixa nada e explica o motivo.
  templateDownload.addEventListener("click", event => {
    if (templateDownload.getAttribute("aria-disabled") !== "true") return;
    event.preventDefault();
    templateStatus.textContent = "Modelo oficial indisponível neste protótipo. Nenhum arquivo foi baixado.";
  });
  dialog.querySelectorAll("[data-import-next]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.importNext)));
  dialog.querySelectorAll("[data-import-back]").forEach(button => button.addEventListener("click", () => showPanel(button.dataset.importBack)));
  input.addEventListener("change", () => { if (input.files[0]) selectFile(input.files[0]); });
  document.getElementById("student-import-remove").addEventListener("click", () => { clearFile(); input.focus(); });
  reviewButton.addEventListener("click", showReview);
  submitButton.addEventListener("click", openResults);
  results.addEventListener("student-import:close", closeResults);
  for (const eventName of ["dragenter", "dragover"]) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add("is-dragging"); });
  for (const eventName of ["dragleave", "drop"]) dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove("is-dragging"); });
  dropzone.addEventListener("drop", event => { const file = event.dataTransfer.files[0]; if (file) selectFile(file); });
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeDialog(); });
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const items = [...dialog.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled)")].filter(item => item.getClientRects().length);
    if (!items.length) return;
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  });
})();
