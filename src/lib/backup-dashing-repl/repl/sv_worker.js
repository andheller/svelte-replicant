// import * as rollup from "rollup/dist/es/rollup.browser.js";

const CDN_URL = "https://unpkg.com";
const component_lookup = new Map();
const fetch_cache = new Map();

let fulfil_ready;
const ready = new Promise((f) => {
  fulfil_ready = f;
});

async function fetch_package(url) {
  return (await fetch(url)).text();
}

function generate_lookup(components) {
  for (let i = 0; i < components.length; i++) {
    component_lookup.set(
      `./${components[i].name}.${components[i].type}`,
      components[i]
    );
  }
}

self.addEventListener("message", async (event) => {
  if (event.data.type === "init") {
    console.log("init??");
    try {
      importScripts(`${event.data.svelteUrl}/compiler.js`);
    } catch {
      await import(/* @vite-ignore */ `${event.data.svelteUrl}/compiler.js`);
    }
    fulfil_ready();
  } else if (event.data.type === "compile") {
    generate_lookup(event.data.components);
    const bundle = await rollup.rollup({
      input: "./App.svelte",
      plugins: [
        {
          name: "repl-plugin",
          async resolveId(importee, importer) {
            // handle imports from 'svelte'

            // import x from 'svelte'
            if (importee === "svelte") return `${CDN_URL}/svelte/index.mjs`;

            // import x from 'svelte/somewhere'
            if (importee.startsWith("svelte/")) {
              return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
            }

            // import x from './file.js' (via a 'svelte' or 'svelte/x' package)
            if (importer && importer.startsWith(`${CDN_URL}/svelte`)) {
              const resolved = new URL(importee, importer).href;
              if (resolved.endsWith(".mjs")) return resolved;
              return `${resolved}/index.mjs`;
            }

            // local repl components
            if (component_lookup.has(importee)) return importee;

            // relative imports from a remote package
            if (importee.startsWith("."))
              return new URL(importee, importer).href;

            // bare named module imports (importing an npm package)

            // get the package.json and load it into memory

            // const pkg_url = `${CDN_URL}/${importee}/package.json`;
            // const pkg = JSON.parse(await fetch_package(pkg_url));
            const pkg_url = await follow_redirects(
              `${packagesUrl}/${importee}/package.json`,
              uid
            );
            const pkg_json = (await fetch_if_uncached(pkg_url, uid)).body;
            const pkg = JSON.parse(pkg_json);

            // get an entry point from the pkg.json - first try svelte, then modules, then main
            if (pkg.svelte || pkg.module || pkg.main) {
              // use the aobove url minus `/package.json` to resolve the URL
              const url = pkg_url.replace(/\/package\.json$/, "");
              return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`)
                .href;
            }

            // we probably missed stuff, pass it along as is
            return importee;
          },
          async load(id) {
            // local repl components are stored in memory
            // this is our virtual filesystem
            if (component_lookup.has(id))
              return component_lookup.get(id).source;

            // everything else comes from a cdn
            return await fetch_package(id);
          },
          transform(code, id) {
            // our only transform is to compile svelte components
            //@ts-ignore
            if (/.*\.svelte/.test(id)) return svelte.compile(code).js.code;
          },
        },
      ],
    });

    // a touch longwinded but output contains an array of chunks
    // we are not code-splitting, so we only have a single chunk
    const output = (await bundle.generate({ format: "esm" })).output[0].code;
    self.postMessage(output);
  }
});

async function fetch_if_uncached(url) {
  if (fetch_cache.has(url)) {
    return fetch_cache.get(url);
  }
  await new Promise((r) => setTimeout(r, 200));

  const promise = fetch(url)
    .then(async (r) => {
      if (r.ok) {
        return {
          url: r.url,
          body: await r.text(),
        };
      }

      throw new Error(await r.text());
    })
    .catch((err) => {
      fetch_cache.delete(url);
      throw err;
    });

  fetch_cache.set(url, promise);
  return promise;
}

async function follow_redirects(url) {
  const res = await fetch_if_uncached(url);
  return res.url;
}
