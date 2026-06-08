// Document numbering — the Adept ERP scheme, packaged for every NS project.
// DB-agnostic (works whether your store is Neon/Postgres or Airtable).
//
// ONE order "spine" number flows across every document for an order:
//   Quote / Estimate   EST-<order>
//   Invoice            INV-<order>            (INV-<order>-<seq> when split)
//   Purchase Order     PO-<order>-<code>      (-<n> for a repeat PO to same supplier)
//   Bill               BILL-<order>-<code>    (-<seq> for repeats)
//
//   <order> = a single number per order, allocated ONCE and reused on every doc.
//             Allocate it race-safe at the source: a Postgres SEQUENCE
//             (SELECT nextval(...)) or an Airtable autonumber. Never re-derive it.
//   <code>  = a stable 3-letter code per supplier/client, assigned ONCE and kept
//             forever via a UNIQUE constraint (try candidates until one is free).

export const DOC_PREFIX = {
  quote: "EST", estimate: "EST",
  invoice: "INV",
  po: "PO", purchaseOrder: "PO",
  bill: "BILL",
};

// Format a document number from the spine order # (+ entity code for PO/Bill).
export function docNumber(type, { order, code, seq } = {}) {
  const p = DOC_PREFIX[type];
  if (!p) throw new Error(`unknown doc type: ${type}`);
  if (order == null) throw new Error("order (spine number) required");
  if (p === "PO" || p === "BILL") {
    if (!code) throw new Error(`${type} needs a supplier/client code`);
    const base = `${p}-${order}-${code}`;
    return seq && seq > 1 ? `${base}-${seq}` : base;
  }
  return seq && seq > 1 ? `${p}-${order}-${seq}` : `${p}-${order}`;
}

// Ordered candidate 3-letter codes for a name (most-natural first), all [A-Z]{3}.
// Pair with a UNIQUE constraint: insert the first that's free → stable forever.
export function entityCodeCandidates(name) {
  const up = String(name).toUpperCase().replace(/[^A-Z0-9 ]/g, "");
  const words = up.split(/\s+/).filter(Boolean);
  const letters = up.replace(/[^A-Z]/g, "") || "SUP";
  const out = [];
  const push = (c) => { if (c && c.length === 3 && /^[A-Z]{3}$/.test(c) && !out.includes(c)) out.push(c); };
  push(words.map((w) => w[0]).join("").slice(0, 3));        // initials of first 3 words
  push(letters.slice(0, 3));                                // first three letters
  if (words[1]) push(words[0].slice(0, 2) + words[1][0]);   // w1[0..1] + w2[0]
  if (words[1]) push(words[0][0] + words[1].slice(0, 2));   // w1[0] + w2[0..1]
  const pre = letters.slice(0, 2).padEnd(2, "X");
  for (let i = 2; i < letters.length; i++) push(pre + letters[i]);
  for (const a of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") push(pre + a);
  return out;
}

// Single best-guess code (no uniqueness guarantee) — display/derivation only.
export function entityCode(name) {
  return entityCodeCandidates(name)[0] || "SUP";
}

// Pull the spine order # out of any doc number (EST-12348 / PO-12348-NOF / INV-12348-2).
export function parseOrderNumber(doc) {
  const m = String(doc).match(/\d{4,}/);
  return m ? parseInt(m[0], 10) : null;
}

// Next spine number from the set of existing doc numbers (reconciliation/seed —
// DB-agnostic). For live allocation prefer an atomic sequence/autonumber.
export function nextOrderFromExisting(docNumbers, { start = 10000, min = 10000 } = {}) {
  let max = start - 1;
  for (const d of docNumbers || []) {
    const n = parseOrderNumber(d);
    if (n != null && n >= min && n > max) max = n;
  }
  return max + 1;
}
