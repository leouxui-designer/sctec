"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { readConfig } = require("../config.cjs");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "prototype-manifest.json"), "utf8"));
const viewer = fs.readFileSync(path.join(root, "viewer.js"), "utf8");
assert.equal(manifest.contractVersion, 1, "manifest contract must remain v1");
assert.equal(manifest.messagingProtocolVersion, 1, "protocol must remain v1");
assert.doesNotThrow(() => readConfig({ PORT: "4185", SCTEC_ENV: "local", DESIGN_HUB_ORIGINS: "http://127.0.0.1:5173", SCTEC_VIEWER_ORIGIN: "http://127.0.0.1:4185" }));
assert.throws(() => readConfig({ SCTEC_ENV: "staging", DESIGN_HUB_ORIGINS: "http://127.0.0.1:5173", SCTEC_VIEWER_ORIGIN: "http://127.0.0.1:4185" }), /HTTPS|staging/u);
assert.throws(() => readConfig({ SCTEC_ENV: "staging", DESIGN_HUB_ORIGINS: "https://design.example", SCTEC_VIEWER_ORIGIN: "https://viewer.example/path" }), /somente protocolo/u);
assert.equal(manifest.prototypeId, "sctec-portal-talentos-independent");
assert.equal(manifest.screens.length, 19);
assert.equal(manifest.journeys.length, 11);
assert.deepEqual(manifest.profiles, []);
assert.deepEqual(manifest.capabilities, []);

const screens = new Map(manifest.screens.map((screen) => [screen.id, screen]));
assert.equal(screens.size, manifest.screens.length, "screen IDs must be unique");
const mappingRegex = /"([^"]+)": Object\.freeze\(\{ route: "(#[^"]+)", path: "(\/[^"]+)" \}\)/gu;
const viewerMappings = new Map();
for (const match of viewer.matchAll(mappingRegex)) viewerMappings.set(match[1], { route: match[2], path: match[3] });
assert.equal(viewerMappings.size, manifest.screens.length, "viewer mapping must cover all manifest screens");
for (const screen of manifest.screens) {
  const mapped = viewerMappings.get(screen.id);
  assert.ok(mapped, "missing viewer mapping for " + screen.id);
  assert.equal(mapped.route, "#" + screen.route, "route mismatch for " + screen.id);
  assert.ok(fs.existsSync(path.join(root, mapped.path)), "missing local page for " + screen.id);
}
const journeyIds = new Set();
const stepIds = new Set();
for (const journey of manifest.journeys) {
  assert.ok(!journeyIds.has(journey.id), "duplicate journey ID " + journey.id);
  journeyIds.add(journey.id);
  assert.ok(journey.steps.length > 0, "journey has no steps " + journey.id);
  for (const step of journey.steps) {
    assert.ok(!stepIds.has(step.id), "duplicate step ID " + step.id);
    stepIds.add(step.id);
    const screen = screens.get(step.screenId);
    assert.ok(screen, "unknown screen " + step.screenId);
    assert.equal(step.route, screen.route, "step route mismatch " + step.id);
  }
}
assert.equal(stepIds.size, 32, "manifest journey steps must remain stable");
assert.ok(!manifest.screens.some((screen) => ["/sctec/home", "/sctec/companies", "/sctec/admin/deprecated"].includes(screen.route)));
console.log("Manifesto SCTEC validado: 19 telas, 11 jornadas e " + stepIds.size + " etapas.");
