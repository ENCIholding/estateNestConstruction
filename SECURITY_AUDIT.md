# SECURITY AUDIT (PASS 1)

Date: 2026-05-26
Project: Estate Nest Capital public site + ENCI BuildOS dashboard
Auditor Mode: PASS 1 (audit only, no application patching)
Scope Restriction: package config, route definitions, sidebar/navigation config, auth/session flow, API routes, and related auth/security support files.

## 1) File Paths Found

### Package Configuration
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\package.json`

### App Routes / Pages Routes
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\App.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\pages\ManagementLogin.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\pages\ManagementModuleUnavailable.tsx`

### Middleware File (if present)
- No middleware file found in repository root/app scope (no `middleware.ts`, `_middleware.ts`, or equivalent route middleware file detected).

### Sidebar / Navigation Configuration
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\lib\management.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\ManagementLayout.tsx`

### Auth / Session Files
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\RequireManagementAuth.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\pages\ManagementLogin.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\auth.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\managementSession.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\managementUsers.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosPermissions.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosModules.ts`

### API Routes
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\login.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\logout.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\session.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\status.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\projects.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\projects\[id].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\buildos\[module].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\buildos\[module]\[recordId].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\email\send.ts`

### Related Security/Infra Config Observed
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\vercel.json`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\security\ContentProtectionGuard.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosStore.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosValidation.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\email.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\projects.ts`

## 2) Current Auth Method

- Authentication is custom username/password using environment-backed records (`MANAGEMENT_USERS_JSON` or fallback `MANAGEMENT_USERNAME` / `MANAGEMENT_PASSWORD`).
- Session token is custom HMAC-signed payload (`sha256`) with `MANAGEMENT_SESSION_SECRET`.
- Session is stored in `HttpOnly; Secure; SameSite=Lax` cookie: `enci_mgmt_session`.
- Frontend protected pages use `RequireManagementAuth` and `/api/management/session` check.
- API routes generally validate by reading/verifying the same session cookie/token.

## 3) Sidebar Config Location

- Module registry: `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\lib\management.ts`
- Sidebar rendering and visibility logic: `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\ManagementLayout.tsx`

## 4) Protected Route Mechanism

### Frontend Route Protection
- React Router wraps management routes in `RequireManagementAuth` from:
  - `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\App.tsx`
  - `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\RequireManagementAuth.tsx`
- `RequireManagementAuth` performs a session API check and redirects to `/management/login` when unauthenticated.

### API Protection
- Auth token verification via:
  - `api/_lib/auth.ts` (`getCookie`, `readSessionToken`, `verifySessionToken`)
  - `api/_lib/managementSession.ts` (`getAuthenticatedManagementUser`)
- BuildOS module endpoints enforce module read/write/export permissions and some project scoping checks.

## 5) Top 10 Security Gaps

1. **Plaintext credential model (Critical)**
   - User passwords are compared in plaintext from env-managed records (`managementUsers.ts`), no hashing/salting.

2. **No login brute-force/rate limiting (Critical)**
   - `api/management/login.ts` has no throttling, lockout, or IP/device-based controls.

3. **Role-to-read model is overly permissive by default (High)**
   - `getPermissionsForRole` grants read access to all BuildOS modules for every role, including `Read Only`.

4. **Project access defaults open when project allowlist is absent (High)**
   - `canAccessProject` / `canAccessAnyLinkedProject` allow broad access if `allowedProjectIds` is unset.

5. **Non-BuildOS project APIs lack role/permission enforcement (High)**
   - `api/management/projects.ts` and `api/management/projects/[id].ts` rely on token auth only; no module permission checks.

6. **Project update endpoint lacks strict server-side field allowlist (High)**
   - `projects/[id].ts` accepts broad `Partial<ManagementProject>` patch payload for `PUT` without explicit mutation allowlist.

7. **Email send endpoint usable by any authenticated account (High)**
   - `api/management/email/send.ts` checks auth token but does not enforce role/module permission or recipient policy.

8. **Sensitive endpoint actions lack CSRF origin/referer verification (Medium)**
   - State-changing routes (`POST/PUT/DELETE`) rely on cookie auth without explicit CSRF token/origin enforcement.

9. **Error details are reflected to clients in multiple API handlers (Medium)**
   - Handlers return internal exception strings (`error.message`) in 500 responses (e.g., login/session/projects/buildos/email paths).

10. **Frontend module visibility is not role-filtered (Medium)**
   - Sidebar renders enabled modules from static config rather than authenticated user permission matrix.

## 6) Critical Risks

- Plaintext credential validation and storage model in management auth flow.
- No brute-force/rate limiting on authentication endpoint.

## 7) High Risks

- Over-broad role read permissions and permissive default project scoping.
- Project CRUD APIs without granular role/module authorization checks.
- Authenticated email relay without role gating or send restrictions.
- Update endpoint mutation model lacks strict allowlist/ownership constraints.

## 8) Medium Risks

- Missing CSRF-specific controls for cookie-authenticated mutating routes.
- Internal server error details exposed in API responses.
- Sidebar visibility not permission-driven (information disclosure of module surface).
- No centralized middleware enforcement layer for route/API policy.
- No explicit `Permissions-Policy`/`Strict-Transport-Security` headers in current vercel header config.

## 9) Low Risks

- `ContentProtectionGuard` is client-side deterrence only and can create false confidence if treated as security control.
- Upload clients reference `/api/management/upload` while no upload route is present in current inspected API routes; this is an operational gap and potential future security risk if implemented without strict validation.
- Dependency risk posture not fully verifiable from scoped inspection alone (no audit output captured in this pass).

## 10) Files Involved

- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\package.json`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\vercel.json`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\App.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\lib\management.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\ManagementLayout.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\management\RequireManagementAuth.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\pages\ManagementLogin.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\src\components\security\ContentProtectionGuard.tsx`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\login.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\logout.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\session.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\status.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\projects.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\projects\[id].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\buildos\[module].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\buildos\[module]\[recordId].ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\management\email\send.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\auth.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\managementSession.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\managementUsers.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosPermissions.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosModules.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosStore.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\buildosValidation.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\email.ts`
- `C:\ENCI-PROJECTS\ENCIDASHCONSTRUCTION_PUBLISH\api\_lib\projects.ts`

## 11) Recommended Patch Order (Do Not Apply in PASS 1)

1. Replace plaintext auth with hashed password verification and secure credential lifecycle.
2. Add login rate limiting, progressive lockout, and failed-attempt logging.
3. Introduce centralized permission matrix for sidebar + frontend route visibility + API authorization.
4. Lock down `projects` and `projects/[id]` with explicit role/module permissions and scoped access checks.
5. Restrict email send endpoint by role permission and recipient policies; add rate limiting and audit logs.
6. Add CSRF protections (origin/referer + anti-CSRF token for mutating requests).
7. Remove internal error detail leakage from API responses; keep details server-side logs only.
8. Add standardized API security headers (`Permissions-Policy`, HSTS where TLS-terminated).
9. Implement secure upload API with type/MIME/size/filename/extension validation before enabling upload clients.
10. Add full security CI checks (`npm audit`, dependency policy, secret scanning, lint rules for dangerous patterns).

## PASS 1 Enforcement

- No route changes made.
- No sidebar changes made.
- No UI redesign made.
- No app code patched in this pass.
- Single safe artifact created: `SECURITY_AUDIT.md`.
