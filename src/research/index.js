// Domain research presets — supplement-industry scrape/search, on the shared Firecrawl.
// One place for the query tuning so NS, Adept, Foundry all research the same way.
//
//   import { materialSupplierScrape, supplementComanScrape, supplementBrandScrape } from "ns-shared/research";
//   await materialSupplierScrape({ query: "magnesium glycinate" });   // search
//   await materialSupplierScrape("https://supplier.com");             // scrape a known page
//   await supplementComanScrape({ query: "gummy manufacturer USA" });
//   await supplementBrandScrape("https://brand.com");
//
// Each takes a URL (string starting http) → scrape, or { query } → tuned search.
import { scrape, search } from "../scrape/index.js";

async function route(input, qualifier, opts = {}) {
  const url = typeof input === "string" ? input : input && input.url;
  if (url && /^https?:\/\//i.test(url)) return scrape(url, opts);
  const q = typeof input === "string" ? input : input && input.query;
  if (!q) throw new Error("provide a url or a query");
  return search(`${q} ${qualifier}`, opts);
}

// Raw-material / ingredient suppliers.
export function materialSupplierScrape(input, opts) {
  return route(input, "raw material ingredient supplier wholesale", opts);
}

// Supplement contract manufacturers (co-mans / co-packers).
export function supplementComanScrape(input, opts) {
  return route(input, "supplement contract manufacturer co-packer cGMP", opts);
}

// Supplement brands / finished-product companies.
export function supplementBrandScrape(input, opts) {
  return route(input, "supplement brand company finished product", opts);
}

export const RESEARCH_TYPES = {
  material: materialSupplierScrape,
  coman: supplementComanScrape,
  brand: supplementBrandScrape,
};
