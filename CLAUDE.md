# ns-shared — Claude session context

> Silent mode (global): "On it." then work silently — final RESULT/DO NEXT/BLOCKERS only.
> Airtable: IDs only for lookups/queries/mapping/schema; friendly names only in UI.

**What:** The ONE place shared cross-project logic lives so a fix propagates everywhere (no copy-paste drift). Apps import it: `npm install github:NutraSolutions/ns-shared`.
**Rule:** if logic is used by 2+ projects, it belongs HERE, imported — never duplicated into each app. When you fix a shared behavior, fix it in this package + bump version; do NOT patch each app's copy.
**Secrets:** consumed from each app's env at runtime; keys declared in `.env.keys`. Source of truth ../MASTER_CONFIG.md.

<!-- AI-OS -->
## AI-OS workspace

Part of the AI-OS workspace at `C:\AI-OS`. **Read `C:\AI-OS\CLAUDE.md` for operating rules + `C:\AI-OS\NEXT-ACTIONS.md` for the work queue.**

- **This package:** ns-shared — GitHub repo `NutraSolutions/ns-shared`, primary branch `main`/`master`.
- **Shared code:** `C:\AI-OS\packages\ns-shared`. **Tools:** `C:\AI-OS\tools`. **Services/modules:** `C:\AI-OS\modules`.
- **Secrets:** never hardcode. Source of truth = `C:\AI-OS\MASTER_CONFIG.md`; run `python C:\AI-OS\sync-env.py local` to regenerate this project's `.env`. Never hand-edit synced env files.
- **Autonomy:** execute from NEXT-ACTIONS without asking for routine work; only stop for owner-decisions, destructive/outward-facing actions, or real blockers.
- **Push silently:** `git -c credential.helper= push https://x-access-token:$TOK@github.com/NutraSolutions/ns-shared.git <ref>`.
