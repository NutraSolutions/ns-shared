# ns-shared — Claude session context

> Silent mode (global): "On it." then work silently — final RESULT/DO NEXT/BLOCKERS only.
> Airtable: IDs only for lookups/queries/mapping/schema; friendly names only in UI.

**What:** The ONE place shared cross-project logic lives so a fix propagates everywhere (no copy-paste drift). Apps import it: `npm install github:NutraSolutions/ns-shared`.
**Rule:** if logic is used by 2+ projects, it belongs HERE, imported — never duplicated into each app. When you fix a shared behavior, fix it in this package + bump version; do NOT patch each app's copy.
**Secrets:** consumed from each app's env at runtime; keys declared in `.env.keys`. Source of truth ../MASTER_CONFIG.md.
