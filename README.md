# ns-shared

Single source for logic reused across NS projects (Adept, NS portal, automations, future).
**Fix once here → every app that imports it gets the fix.** No more copy-paste drift.

## Install (per app)
```
npm install github:NutraSolutions/ns-shared
```
(or a pinned tag: `github:NutraSolutions/ns-shared#v0.1.0`)

## Use
```js
import { ocrLabel } from "ns-shared/ocr";
const result = await ocrLabel(base64Jpeg);   // { text, fields, confidence, model }
```

## Modules
- `ocr` — tiered SFP OCR: Gemini 2.5 Flash → 2.5 Pro → GPT-4o tiebreaker. Tune the prompt/parse in `src/ocr/index.js` — once.

## Roadmap (extract from apps, into here)
- clipboard-paste image upload component (the Adept fix → reuse in NS)
- feedback widget (canonical lives in the `feedback-widget` skill; mirror runtime here)
- Airtable client (ID-keyed, per global rule)

## How updates propagate
Fix a module → bump `version` → push → in each app `npm update ns-shared` (or Vercel reinstalls on deploy). One fix, everywhere.
