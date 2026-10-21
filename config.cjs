"use strict";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function exactOrigin(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} deve ser uma origem HTTP(S) válida.`); }
  if (url.origin !== value || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${label} deve conter somente protocolo, host e porta.`);
  }
  return url.origin;
}

function validateOrigin(value, { mode, label }) {
  const origin = exactOrigin(value, label);
  const url = new URL(origin);
  if (mode === "local") {
    if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname)) {
      throw new Error(`${label} local deve usar HTTP em loopback.`);
    }
  } else if (url.protocol !== "https:" || LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error(`${label} de staging deve usar HTTPS fora de loopback.`);
  }
  return origin;
}

function readConfig(env = process.env) {
  const mode = env.SCTEC_ENV || "local";
  if (mode !== "local" && mode !== "staging") throw new Error("SCTEC_ENV deve ser local ou staging.");
  const port = Number(env.PORT || 4185);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT inválida.");
  const viewerOrigin = validateOrigin(
    env.SCTEC_VIEWER_ORIGIN || `http://127.0.0.1:${port}`,
    { mode, label: "SCTEC_VIEWER_ORIGIN" },
  );
  const rawOrigins = env.DESIGN_HUB_ORIGINS || (mode === "local" ? "http://127.0.0.1:5173,http://127.0.0.1:5186" : "");
  const origins = [...new Set(rawOrigins.split(",").map((value) => value.trim()).filter(Boolean))]
    .map((value) => validateOrigin(value, { mode, label: "DESIGN_HUB_ORIGINS" }));
  if (origins.length === 0) throw new Error("DESIGN_HUB_ORIGINS deve conter pelo menos uma origem.");
  if (mode === "staging" && (!env.SCTEC_VIEWER_ORIGIN || !env.DESIGN_HUB_ORIGINS)) {
    throw new Error("Staging exige SCTEC_VIEWER_ORIGIN e DESIGN_HUB_ORIGINS explícitos.");
  }
  return Object.freeze({ mode, port, viewerOrigin, parentOrigins: Object.freeze(origins) });
}

module.exports = { readConfig, exactOrigin, validateOrigin };
