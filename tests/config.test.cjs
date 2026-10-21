"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { readConfig } = require("../config.cjs");

test("configuração local aceita apenas origins loopback explícitos", () => {
  const config = readConfig({ SCTEC_ENV: "local", PORT: "4185", SCTEC_VIEWER_ORIGIN: "http://127.0.0.1:4185", DESIGN_HUB_ORIGINS: "http://127.0.0.1:5173" });
  assert.deepEqual(config.parentOrigins, ["http://127.0.0.1:5173"]);
  assert.throws(() => readConfig({ SCTEC_ENV: "local", SCTEC_VIEWER_ORIGIN: "https://viewer.example", DESIGN_HUB_ORIGINS: "http://127.0.0.1:5173" }), /loopback/u);
});

test("configuração staging exige HTTPS e valores explícitos", () => {
  const config = readConfig({ SCTEC_ENV: "staging", SCTEC_VIEWER_ORIGIN: "https://sctec-viewer.example", DESIGN_HUB_ORIGINS: "https://design-hub.example" });
  assert.equal(config.viewerOrigin, "https://sctec-viewer.example");
  assert.throws(() => readConfig({ SCTEC_ENV: "staging", SCTEC_VIEWER_ORIGIN: "https://sctec-viewer.example", DESIGN_HUB_ORIGINS: "http://design-hub.example" }), /HTTPS/u);
  assert.throws(() => readConfig({ SCTEC_ENV: "staging", SCTEC_VIEWER_ORIGIN: "https://sctec-viewer.example" }), /pelo menos uma origem|explícitos/u);
});
