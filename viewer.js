(() => {
  "use strict";

  const PROTOCOL = "design-hub-prototype";
  const VERSION = 1;
  const TRUSTED_PARENT_ORIGINS = new Set(window.__SCTEC_VIEWER_CONFIG__?.trustedParentOrigins || [
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5181",
    "http://127.0.0.1:5186",
  ]);
  const BASE = window.location.pathname.replace(/\/[^/]*$/, "");
  const rawScreens = Object.freeze({
    "sctec-login": Object.freeze({ route: "#/sctec/talent-login", path: "/pages/login.html" }),
    "sctec-student-companies": Object.freeze({ route: "#/sctec/student/companies", path: "/pages/aluno-empresas.html" }),
    "sctec-student-profile": Object.freeze({ route: "#/sctec/student/profile", path: "/pages/aluno-perfil.html" }),
    "sctec-talent-public-profile": Object.freeze({ route: "#/sctec/talent/public-profile", path: "/pages/aluno-perfil-publico.html" }),
    "sctec-student-company-profile": Object.freeze({ route: "#/sctec/student/company-profile", path: "/pages/empresa-perfil-publico.html" }),
    "sctec-company-candidates": Object.freeze({ route: "#/sctec/company/candidates", path: "/pages/painel-candidatos.html" }),
    "sctec-company-profile": Object.freeze({ route: "#/sctec/company/profile", path: "/pages/painel-perfil.html" }),
    "sctec-acate-companies": Object.freeze({ route: "#/sctec/acate/companies", path: "/pages/acate-empresas.html" }),
    "sctec-acate-company-profile": Object.freeze({ route: "#/sctec/acate/company-profile", path: "/pages/acate-empresa-perfil.html" }),
    "sctec-acate-company-edit": Object.freeze({ route: "#/sctec/acate/company-edit", path: "/pages/acate-empresa-editar.html" }),
    "sctec-admin-students": Object.freeze({ route: "#/sctec/admin/students", path: "/pages/admin-alunos.html" }),
    "sctec-admin-student-profile": Object.freeze({ route: "#/sctec/admin/student-profile", path: "/pages/admin-aluno-perfil.html" }),
    "sctec-admin-student-create": Object.freeze({ route: "#/sctec/admin/student-create", path: "/pages/admin-aluno-cadastro.html" }),
    "sctec-admin-companies": Object.freeze({ route: "#/sctec/admin/companies", path: "/pages/admin-empresas.html" }),
    "sctec-admin-company-create": Object.freeze({ route: "#/sctec/admin/company-create", path: "/pages/admin-empresa-cadastro.html" }),
    "sctec-admin-company-edit": Object.freeze({ route: "#/sctec/admin/company-edit", path: "/pages/admin-empresa-editar.html" }),
    "sctec-admin-users": Object.freeze({ route: "#/sctec/admin/users", path: "/pages/admin-usuarios.html" }),
    "sctec-admin-user-create": Object.freeze({ route: "#/sctec/admin/user-create", path: "/pages/admin-usuario-cadastro.html" }),
    "sctec-admin-tags": Object.freeze({ route: "#/sctec/admin/tags", path: "/pages/admin-tags.html" }),
  });
  const screens = Object.freeze(Object.fromEntries(Object.entries(rawScreens).map(([id, screen]) => [id, Object.freeze({ ...screen, path: BASE + screen.path })])));
  const routes = new Map(Object.entries(screens).map(([id, screen]) => [screen.route, { id, ...screen }]));
  let frame = document.getElementById("sctec-content");
  const error = document.getElementById("viewer-error");
  let stagedFrame = null;
  let currentScreenId = "sctec-home";
  let frameReady = false;
  let readySent = false;
  let pendingNavigation = null;
  let generation = 0;
  const sessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `sctec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  let navigationSequence = 0;

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isRequestId(value) {
    return typeof value === "string" && value.length > 0 && value.length <= 200 && value === value.trim();
  }

  function isMessage(value) {
    return isRecord(value) && value.protocol === PROTOCOL && value.version === VERSION && typeof value.type === "string";
  }

  function respond(type, requestId, ok, errorCode, targetOrigin) {
    if (!isRequestId(requestId) || !TRUSTED_PARENT_ORIGINS.has(targetOrigin)) return;
    window.parent.postMessage({
      protocol: PROTOCOL,
      version: VERSION,
      type,
      requestId,
      payload: { ok, ...(errorCode ? { errorCode } : {}) },
    }, targetOrigin);
  }

  function announceReady() {
    if (readySent || window.parent === window) return;
    readySent = true;
    const readyMessage = {
      protocol: PROTOCOL,
      version: VERSION,
      type: "VIEWER_READY",
      payload: { capabilities: ["navigate"], sessionId },
    };
    // Referrer is intentionally suppressed by the host iframe. Send only to
    // the small, explicit loopback allowlist; the shell independently checks
    // origin and source window before accepting the handshake.
    TRUSTED_PARENT_ORIGINS.forEach((origin) => window.parent.postMessage(readyMessage, origin));
  }

  function currentPath(targetFrame = frame) {
    try { return new URL(targetFrame.contentWindow.location.href).pathname; }
    catch { return ""; }
  }

  function reportScreenChanged(screenId) {
    if (!TRUSTED_PARENT_ORIGINS.size || window.parent === window) return;
    const message = {
      protocol: PROTOCOL,
      version: VERSION,
      type: "VIEWER_SCREEN_CHANGED",
      payload: { screenId, sessionId, sequence: ++navigationSequence },
    };
    // The host accepts only its exact configured origin and iframe Window.
    TRUSTED_PARENT_ORIGINS.forEach((origin) => window.parent.postMessage(message, origin));
  }

  function onContentLoad() {
    frameReady = true;
    const path = currentPath();
    const loaded = Object.entries(screens).find(([, screen]) => screen.path === path);
    if (loaded) {
      const previousScreenId = currentScreenId;
      currentScreenId = loaded[0];
      const route = loaded[1].route;
      if (window.location.hash !== route) history.replaceState(null, "", route);
      // Shell-directed navigation sets currentScreenId before loading, so only
      // a genuine mapped nested-page transition is reported back to the shell.
      if (previousScreenId !== loaded[0] && screens[previousScreenId]) reportScreenChanged(loaded[0]);
    }
    announceReady();
    if (pendingNavigation && path === pendingNavigation.path) {
      const pending = pendingNavigation;
      pendingNavigation = null;
      respond("VIEWER_NAVIGATION_RESULT", pending.requestId, true, undefined, pending.origin);
    }
  }

  function stageScreen(path, navigationGeneration) {
    if (stagedFrame) stagedFrame.remove();

    const nextFrame = document.createElement("iframe");
    nextFrame.className = "sctec-content-frame sctec-content-frame--staging";
    nextFrame.title = "Protótipo SCTEC";
    nextFrame.setAttribute("aria-hidden", "true");
    stagedFrame = nextFrame;

    nextFrame.addEventListener("load", () => {
      if (navigationGeneration !== generation || stagedFrame !== nextFrame) {
        nextFrame.remove();
        return;
      }

      const previousFrame = frame;
      previousFrame.removeEventListener("load", onContentLoad);
      previousFrame.id = "sctec-content-previous";
      previousFrame.setAttribute("aria-hidden", "true");

      nextFrame.id = "sctec-content";
      nextFrame.classList.remove("sctec-content-frame--staging");
      nextFrame.removeAttribute("aria-hidden");
      nextFrame.addEventListener("load", onContentLoad);
      frame = nextFrame;
      stagedFrame = null;

      onContentLoad();
      previousFrame.remove();
    }, { once: true });

    document.body.insertBefore(nextFrame, error);
    nextFrame.src = path;
  }

  function navigate(screenId, route, requestId, origin, confirmed = false) {
    const screen = screens[screenId];
    if (!screen) {
      respond("VIEWER_NAVIGATION_RESULT", requestId, false, "INVALID_SCREEN", origin);
      return;
    }
    if (screen.route !== route || routes.get(route)?.id !== screenId) {
      respond("VIEWER_NAVIGATION_RESULT", requestId, false, "INVALID_ROUTE", origin);
      return;
    }

    // A local page may defer replacement while its draft confirmation is open.
    // Existing destination/origin/protocol checks above and in message handling stay intact.
    if (!confirmed && screenId !== currentScreenId) {
      let confirmNavigation;
      try { confirmNavigation = frame.contentWindow?.sctecConfirmNavigation; } catch { /* cross-origin pages have no hook */ }
      if (typeof confirmNavigation === 'function' && confirmNavigation(
        () => navigate(screenId, route, requestId, origin, true),
        () => respond("VIEWER_NAVIGATION_RESULT", requestId, false, "FAILED", origin)
      )) {
        const currentRoute = screens[currentScreenId]?.route;
        if (currentRoute && window.location.hash !== currentRoute) history.replaceState(null, '', currentRoute);
        return;
      }
    }

    currentScreenId = screenId;
    if (pendingNavigation) {
      respond("VIEWER_NAVIGATION_RESULT", pendingNavigation.requestId, false, "FAILED", pendingNavigation.origin);
    }
    if (frameReady && currentPath() === screen.path) {
      pendingNavigation = null;
      respond("VIEWER_NAVIGATION_RESULT", requestId, true, undefined, origin);
      return;
    }

    const requestGeneration = ++generation;
    pendingNavigation = { requestId, origin, path: screen.path, generation: requestGeneration };
    if (window.location.hash !== screen.route) history.replaceState(null, "", screen.route);
    frameReady = false;
    stageScreen(screen.path, requestGeneration);
  }

  frame.addEventListener("load", onContentLoad);
  window.addEventListener("hashchange", () => {
    const destination = routes.get(window.location.hash);
    if (destination && destination.id !== currentScreenId) {
      navigate(destination.id, destination.route, undefined, "");
    }
  });

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || !TRUSTED_PARENT_ORIGINS.has(event.origin) || !isMessage(event.data)) return;
    const message = event.data;
    if (!isRequestId(message.requestId) || !isRecord(message.payload)) return;

    if (message.type === "VIEWER_NAVIGATE") {
      const { screenId, route } = message.payload;
      if (typeof screenId !== "string" || typeof route !== "string") {
        respond("VIEWER_NAVIGATION_RESULT", message.requestId, false, "INVALID_ROUTE", event.origin);
        return;
      }
      navigate(screenId, route, message.requestId, event.origin);
    } else if (message.type === "VIEWER_SET_PROFILE") {
      respond("VIEWER_PROFILE_RESULT", message.requestId, false, "UNSUPPORTED", event.origin);
    }
  });

  const initialRoute = routes.get(window.location.hash);
  if (initialRoute) {
    currentScreenId = initialRoute.id;
    frame.src = initialRoute.path;
  } else {
    frame.src = BASE + "/index.html";
  }
})();
