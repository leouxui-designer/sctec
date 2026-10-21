"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

let child;
let baseUrl;
let stderr = "";

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(url) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Viewer saiu antes de iniciar: " + stderr);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timeout ao iniciar viewer: " + stderr);
}

test("servidor standalone serve páginas, manifesto e CORS restrito", async (t) => {
  const port = await freePort();
  baseUrl = "http://127.0.0.1:" + port;
  child = spawn(process.execPath, ["server.cjs"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, PORT: String(port), DESIGN_HUB_ORIGINS: "http://127.0.0.1:5186" },
    stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  t.after(() => { if (child && child.exitCode === null) child.kill(); });
  await waitForServer(baseUrl + "/");

  for (const route of ["/", "/viewer.html", "/prototype-manifest.json", "/pages/login.html", "/pages/empresas.html", "/pages/aluno-empresas.html"]) {
    const response = await fetch(baseUrl + route);
    assert.equal(response.status, 200, route);
  }

  const allowed = await fetch(baseUrl + "/prototype-manifest.json", { headers: { Origin: "http://127.0.0.1:5186" } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://127.0.0.1:5186");
  const denied = await fetch(baseUrl + "/prototype-manifest.json", { headers: { Origin: "http://untrusted.example" } });
  assert.equal(denied.status, 403);
  const write = await fetch(baseUrl + "/prototype-manifest.json", { method: "POST", body: "{}" });
  assert.equal(write.status, 405);
});
