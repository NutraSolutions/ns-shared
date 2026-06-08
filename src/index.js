// ns-shared — single source for logic reused across NS projects.
// Fix a module here → bump version → every app that imports it gets the fix.
export * from "./ocr/index.js";
export * as scrape from "./scrape/index.js";
export * as numbering from "./numbering/index.js";
export * as research from "./research/index.js";
