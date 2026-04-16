# Estate Nest Capital Repo Instructions

## Core standard
- Treat every public or dashboard-visible feature as either real or intentionally offline.
- Do not ship demo records, fabricated proof, fake metrics, or placeholder business claims.
- Prefer honest empty states over decorative enterprise-looking UI.

## Public site
- Do not add public-facing project claims, testimonials, credentials, compliance statements, or metrics unless they are verified by supplied business facts.
- Concept imagery must stay labeled as representative unless it is confirmed completed work.
- Keep core CTAs functional and route-safe.
- Preserve the accessibility control and avoid introducing low-contrast text treatments that cannot support WCAG 2.1 AA expectations in normal reading contexts.

## Management dashboard
- Keep management auth server-backed only.
- If a module lacks a trusted backend, validation path, or persistence model, keep it offline.
- Do not imply CRUD support where records are not durably stored.
- Prefer readiness/status panels and explicit gaps over fake operational data.

## Code and validation
- Run `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run test` before publishing when dependencies are available.
- Update or add targeted tests for auth, configuration parsing, project registry behavior, and other critical logic when touching those paths.
- Keep preview deployments on non-production branches and production tied to reviewed merges only.

## Content gaps
- When real business facts are missing, wire content-ready sections and state the missing inputs clearly.
- Do not backfill missing facts with AI-generated specifics.
