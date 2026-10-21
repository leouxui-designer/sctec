"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { readConfig } = require("../config.cjs");

const config = readConfig(process.env);
if (config.mode !== "staging") throw new Error("build:staging exige SCTEC_ENV=staging.");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if ([".git", "dist", "node_modules"].includes(entry.name)) continue;
  const source = path.join(root, entry.name);
  fs.cpSync(source, path.join(output, entry.name), { recursive: true });
}
const manifestPath = path.join(output, "prototype-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.entryUrl = `${config.viewerOrigin}/viewer.html`;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(path.join(output, "runtime-config.js"), `window.__SCTEC_VIEWER_CONFIG__=${JSON.stringify({ trustedParentOrigins: config.parentOrigins })};\n`);
console.log(`SCTEC staging build generated in ${output}`);
