"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("manifesto, rotas, referências e sintaxe permanecem íntegros", () => {
  const root = path.resolve(__dirname, "..");
  const result = spawnSync(process.execPath, ["scripts/validate-manifest.cjs"], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("scripts inline das páginas HTML têm sintaxe JavaScript válida", () => {
  const root = path.resolve(__dirname, "..");
  const htmlFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith(".html")) htmlFiles.push(file);
    }
  }
  walk(root);
  assert.ok(htmlFiles.length > 0, "nenhuma página HTML foi encontrada");
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/giu)];
    scripts.forEach((match, index) => {
      if (match[1].trim()) new vm.Script(match[1], { filename: `${path.relative(root, file)}#script${index}` });
    });
  }
});
