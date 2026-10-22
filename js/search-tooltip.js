"use strict";

(() => {
  const fields = [...document.querySelectorAll('input[type="search"], input.search-panel__input, #busca-texto')];
  if (!fields.length) return;
  const sync = (field) => { field.title = field.value.trim() || field.placeholder || ""; };
  fields.forEach((field) => {
    sync(field);
    field.addEventListener("input", () => sync(field));
  });
})();
