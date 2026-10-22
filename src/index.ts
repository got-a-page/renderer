/**
 * got-a.page renderer
 *
 * One Worker serves every instant page. A single wildcard DNS record sends
 * all unlisted subdomains here; we look the name up in the compiled index
 * (a static JSON file published by the claim repo's CI) and render it.
 *
 * Caching: the index is fetched through Cloudflare's cache with a short
 * edge TTL, and the cached copy is stored under our own 5-minute TTL -
 * the upstream cache headers are ignored. The GitHub API is never called
 * at request time.
 */

import { themeCss, DEFAULT_THEME } from "./themes.js";
import { personPage, productPage, unclaimedPage, errorPage, type IndexEntry } from "./templates.js";

export interface Env {
  INDEX_URL: string;
  SITE_URL: string;
}

interface IndexFile {
  generatedAt: string;
  pages: Record<string, IndexEntry>;
}

const INDEX_CACHE_TTL_SECONDS = 300;
const INDEX_FETCH_TTL_SECONDS = 60;
const PAGE_CACHE_TTL_SECONDS = 120;

/** Names that must never be treated as pages. */
const RESERVED_HOSTS = new Set(["www", "got-a.page"]);

function subdomainOf(host: string): string | null {
  const h = host.toLowerCase().split(":")[0];
  if (h === "got-a.page" || RESERVED_HOSTS.has(h)) return null;
  if (!h.endsWith(".got-a.page")) return null;
  return h.slice(0, -".got-a.page".length);
}

async function loadIndex(env: Env): Promise<IndexFile | null> {
  const cache = caches.default;
  const key = new Request(env.INDEX_URL);
  const hit = await cache.match(key);
  if (hit) return (await hit.json()) as IndexFile;
  const res = await fetch(env.INDEX_URL, { cf: { cacheTtl: INDEX_FETCH_TTL_SECONDS } });
  if (!res.ok) return null;
  // Cache our own copy, not the upstream response. GitHub Pages sends
  // cache-control: max-age=600, and the Cache API honors that over our
  // TTL, which kept stale indexes (and "unclaimed" pages) alive far past
  // the intended 5 minutes.
  const body = await res.text();
  const stored = new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${INDEX_CACHE_TTL_SECONDS}`,
    },
  });
  await cache.put(key, stored);
  return JSON.parse(body) as IndexFile;
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": `public, max-age=${PAGE_CACHE_TTL_SECONDS}`,
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.hostname;
    const name = subdomainOf(host);

    // Apex and www belong to the website, not the renderer. If a request
    // lands here anyway, send people home.
    if (name === null) {
      return Response.redirect(env.SITE_URL, 302);
    }

    try {
      const index = await loadIndex(env);
      if (!index) return html(errorPage(themeCss(DEFAULT_THEME)), 502);

      const entry = index.pages[name];
      if (!entry) {
        return html(unclaimedPage(name, themeCss(DEFAULT_THEME), url.origin), 404);
      }

      const css = themeCss(entry.theme);
      if (entry.type === "product") {
        return html(productPage(entry, css, url.origin));
      }
      // person is the default template; future types render here as person
      // until their own templates ship (Phase 2).
      return html(personPage(entry, css, url.origin));
    } catch {
      return html(errorPage(themeCss(DEFAULT_THEME)), 500);
    }
  },
} satisfies ExportedHandler<Env>;
