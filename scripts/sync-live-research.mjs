import { Worker } from "node:worker_threads";

const LIVE_ORIGIN = "https://lastz.stresswar.com";
const TREE_WORKER_PATH = "/assets/trees-worker-BJ2v08mC.js";

export async function syncLiveResearchStatic({
  root,
  dryRun,
  writeGeneratedFile,
  log = console.log,
}) {
  const bundle = await loadLiveResearchBundle();
  const allTrees = [...bundle.trees, ...bundle.incompleteTrees];

  const researchDataPayload = serializeFlat({
    "routes/research": {
      data: {
        trees: bundle.trees,
        incompleteTrees: bundle.incompleteTrees,
      },
    },
  });
  await writeGeneratedFile("research.data", researchDataPayload, `${LIVE_ORIGIN}/research`);

  const researchHtmlPayload = serializeFlat({
    loaderData: {
      "routes/research": {
        trees: bundle.trees,
        incompleteTrees: bundle.incompleteTrees,
      },
    },
    actionData: null,
    errors: null,
  });

  const researchShell = buildResearchShell();
  for (const rel of ["research.html", "research/index.html"]) {
    const html = await buildRouteHtml({
      root,
      templatePath: "research.html",
      shellMarkup: researchShell,
      streamPayload: researchHtmlPayload,
    });
    await writeGeneratedFile(rel, html, `${LIVE_ORIGIN}/research`);
  }

  for (const tree of allTrees) {
    const treeDataPayload = serializeFlat({
      "routes/tree": {
        data: {
          tree,
        },
      },
    });
    await writeGeneratedFile(`research/${tree.id}.data`, treeDataPayload, `${LIVE_ORIGIN}/research/${tree.id}`);

    const treeHtmlPayload = serializeFlat({
      loaderData: {
        "routes/tree": {
          tree,
        },
      },
      actionData: null,
      errors: null,
    });

    const treeShell = buildTreeShell(tree.name);
    const html = await buildRouteHtml({
      root,
      templatePath: "research/unit-special-training/index.html",
      shellMarkup: treeShell,
      streamPayload: treeHtmlPayload,
    });
    await writeGeneratedFile(`research/${tree.id}.html`, html, `${LIVE_ORIGIN}/research/${tree.id}`);
    await writeGeneratedFile(`research/${tree.id}/index.html`, html, `${LIVE_ORIGIN}/research/${tree.id}`);
  }

  for (const iconPath of collectIconPaths(allTrees)) {
    const bytes = await fetchBinary(new URL(iconPath, LIVE_ORIGIN).toString());
    await writeGeneratedFile(iconPath.replace(/^\//, ""), bytes, `${LIVE_ORIGIN}${iconPath}`);
  }

  log(
    `${dryRun ? "would sync" : "synced"} live research bundle: ${bundle.trees.length} complete trees, ${bundle.incompleteTrees.length} incomplete trees`,
  );
}

async function loadLiveResearchBundle() {
  const workerSource = await fetchText(new URL(TREE_WORKER_PATH, LIVE_ORIGIN).toString());
  const bootstrap = `
    import { parentPort } from "node:worker_threads";
    globalThis.self = globalThis;
    self.location = new URL(${JSON.stringify(`${LIVE_ORIGIN}/`)});
    const realFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = (input, init = {}) => {
      const url = typeof input === "string" || input instanceof URL
        ? new URL(input, self.location.href)
        : input;
      const headers = new Headers(init.headers || {});
      headers.set("Origin", ${JSON.stringify(LIVE_ORIGIN)});
      headers.set("Referer", ${JSON.stringify(`${LIVE_ORIGIN}/research/shooter-training`)});
      headers.set("User-Agent", "Mozilla/5.0");
      return realFetch(url, { ...init, headers });
    };
    self.postMessage = (msg) => parentPort.postMessage(msg);
    parentPort.on("message", (data) => self.onmessage && self.onmessage({ data }));
    ${workerSource}
  `;

  const worker = new Worker(bootstrap, { eval: true, type: "module" });
  let nextId = 1;
  const pending = new Map();

  const initPromise = new Promise((resolve, reject) => {
    worker.on("message", (message) => {
      if (message.type === "init-done") {
        resolve();
        return;
      }

      if (message.type === "init-error") {
        reject(new Error(message.error));
        return;
      }

      if (!message.reqId || !pending.has(message.reqId)) return;
      const callbacks = pending.get(message.reqId);
      pending.delete(message.reqId);

      if (message.type === "error") {
        callbacks.reject(new Error(message.error));
      } else {
        callbacks.resolve(message);
      }
    });

    worker.on("error", reject);
  });

  function request(message) {
    return new Promise((resolve, reject) => {
      const reqId = nextId++;
      pending.set(reqId, { resolve, reject });
      worker.postMessage({ ...message, reqId });
    });
  }

  try {
    worker.postMessage({ type: "init" });
    await initPromise;
    const response = await request({ type: "getAll" });
    return {
      trees: [...(response.bundle?.trees || [])],
      incompleteTrees: [...(response.bundle?.incompleteTrees || [])],
    };
  } finally {
    await worker.terminate();
  }
}

function serializeFlat(rootValue) {
  const table = [];
  const seen = new Map();
  const primitiveRefs = new Map();

  function add(value) {
    if (value === undefined) return add(null);

    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const key = `${typeof value}:${JSON.stringify(value)}`;
      if (primitiveRefs.has(key)) return primitiveRefs.get(key);
      const index = table.length;
      table.push(value);
      primitiveRefs.set(key, index);
      return index;
    }

    if (seen.has(value)) return seen.get(value);

    if (Array.isArray(value)) {
      const index = table.length;
      const out = [];
      table.push(out);
      seen.set(value, index);
      for (const item of value) out.push(add(item));
      return index;
    }

    const index = table.length;
    const out = {};
    table.push(out);
    seen.set(value, index);
    for (const [key, val] of Object.entries(value)) {
      out[`_${add(key)}`] = add(val);
    }
    return index;
  }

  add(rootValue);
  return JSON.stringify(table);
}

async function buildRouteHtml({ root, templatePath, shellMarkup, streamPayload }) {
  const template = await fetchFile(new URL(templatePath, `file://${root.replace(/\\/g, "/")}/`).toString());
  const scriptStart = template.indexOf('<script>((storageKey2, restoreKey) => {');
  if (scriptStart < 0) {
    throw new Error(`Could not find route bootstrap in ${templatePath}`);
  }

  const bodyTag = template.match(/<body[^>]*>/i)?.[0] || "<body>";
  const headAndOpen = template.slice(0, template.indexOf(bodyTag) + bodyTag.length);
  const scripts = replaceFirstStreamPayload(template.slice(scriptStart), streamPayload);
  return `${headAndOpen}${shellMarkup}${scripts}`;
}

function replaceFirstStreamPayload(html, payload) {
  const marker = 'window.__reactRouterContext.streamController.enqueue("';
  const start = html.indexOf(marker);
  if (start < 0) {
    throw new Error("Could not find React Router stream payload");
  }

  const payloadStart = start + marker.length;
  const payloadEnd = html.indexOf('");</script>', payloadStart);
  if (payloadEnd < 0) {
    throw new Error("Could not find end of React Router stream payload");
  }

  const escaped = escapeForInlineScript(`${payload}\n`);
  return `${html.slice(0, payloadStart)}${escaped}${html.slice(payloadEnd)}`;
}

function escapeForInlineScript(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/<\/script/gi, "<\\/script");
}

function buildResearchShell() {
  return `<div class="min-h-screen bg-slate-950 text-white"><header class="flex flex-col gap-1 px-4 bg-slate-900 border-b border-slate-700 py-3"><div class="flex items-center gap-2"><a class="p-2 -ml-2 text-slate-400 hover:text-white transition-colors" href="/" data-discover="true"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg></a><h1 class="text-lg font-semibold text-white">Research Trees</h1></div><p class="text-slate-400 text-sm">Loading research trees...</p></header><main class="p-6 max-w-5xl mx-auto"><div class="text-sm text-slate-500">Preparing live research data...</div></main></div>`;
}

function buildTreeShell(name) {
  return `<div class="flex flex-col h-dvh bg-slate-950"><header class="flex flex-col gap-1 px-4 bg-slate-900 border-b border-slate-700 py-3"><div class="flex items-center gap-2"><a class="p-2 -ml-2 text-slate-400 hover:text-white transition-colors" href="/research" data-discover="true"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg></a><h1 class="text-lg font-semibold text-white">${escapeHtml(name)}</h1></div><p class="text-slate-400 text-sm">Loading research tree...</p></header><main class="flex-1 grid place-items-center text-slate-500 text-sm">Preparing static tree data...</main></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collectIconPaths(trees) {
  const paths = new Set();
  for (const tree of trees) {
    paths.add(`/icons/research-trees/${tree.id}.png`);
    for (const node of tree.nodes || []) {
      if (node.icon) paths.add(node.icon);
    }
  }
  return [...paths].sort((a, b) => a.localeCompare(b));
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function fetchFile(url) {
  const { readFile } = await import("node:fs/promises");
  return readFile(new URL(url), "utf8");
}
