// Firecrawl — shared web scrape/search for ALL NS projects (Foundry, NS, future).
// Fix once here → every app gets it. Key: FIRECRAWL_API_KEY (MASTER_CONFIG / per-app env).
//
//   import { scrape, search } from "ns-shared/scrape";
//   const md = await scrape("https://example.com");        // -> markdown
//   const hits = await search("contract manufacturers");   // -> results[]

const BASE = "https://api.firecrawl.dev/v1";

function key(opts) {
  const k = (opts && opts.apiKey) || process.env.FIRECRAWL_API_KEY;
  if (!k) throw new Error("FIRECRAWL_API_KEY not set");
  return k;
}

async function call(path, body, opts) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key(opts)}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`firecrawl ${path} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

// Scrape one URL → markdown (default) or requested formats.
export async function scrape(url, opts = {}) {
  const formats = opts.formats || ["markdown"];
  const j = await call("/scrape", { url, formats, onlyMainContent: opts.onlyMainContent !== false }, opts);
  const d = j.data || j;
  return opts.raw ? d : (d.markdown ?? d.html ?? d);
}

// Web search → array of {title, url, description, markdown?}.
export async function search(query, opts = {}) {
  const j = await call("/search", { query, limit: opts.limit ?? 10, ...(opts.scrapeResults ? { scrapeOptions: { formats: ["markdown"] } } : {}) }, opts);
  return (j.data || j.results || []);
}

// Crawl a site (async job) → returns job handle; poll with checkCrawl.
export async function crawl(url, opts = {}) {
  return call("/crawl", { url, limit: opts.limit ?? 50, ...(opts.body || {}) }, opts);
}
