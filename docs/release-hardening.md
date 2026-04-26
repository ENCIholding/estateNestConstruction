# Release hardening

## Recommended branch workflow

- Keep `main` as the only production branch.
- Do day-to-day work on a non-production branch such as `dev`, `staging`, or `fix/site-hardening`.
- Point Vercel preview deployments at non-production branches only.
- Merge to `main` only after preview validation is complete.

## Required checks before merge

- `npm run typecheck`
- `npm run build`
- `npm run verify:env` in the deployment environment
- Manual smoke checks for management login, session expiry, dashboard access, and `/api/management/projects`

## Required Vercel environment variables

- `MANAGEMENT_USERNAME`
- `MANAGEMENT_PASSWORD`
- `MANAGEMENT_SESSION_SECRET`
- `MANAGEMENT_USERS_JSON` optional if you want role-based multi-user management accounts instead of a single admin login
- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `GOOGLE_OAUTH_CLIENT_ID` optional alternative to password SMTP when using Google OAuth mail transport
- `GOOGLE_OAUTH_CLIENT_SECRET` optional alternative to password SMTP when using Google OAuth mail transport
- `GOOGLE_OAUTH_REFRESH_TOKEN` optional alternative to password SMTP when using Google OAuth mail transport
- `GOOGLE_OAUTH_REDIRECT_URI` optional if your Google OAuth mail flow depends on an explicit redirect URI
- `EMAIL_SMTP_HOST` optional, defaults to `smtp.gmail.com`
- `EMAIL_SMTP_PORT` optional, defaults to `465`
- `EMAIL_SMTP_SECURE` optional, defaults to `true` when port `465`
- `EMAIL_FROM_NAME` optional, defaults to `Estate Nest Capital Inc.`
- `EMAIL_FROM_ADDRESS` optional, defaults to `EMAIL_SMTP_USER`
- `EMAIL_REPLY_TO` optional, defaults to `EMAIL_FROM_ADDRESS`
- `EMAIL_INBOX_COPY` optional, defaults to `hello@estatenest.capital`
- `EMAIL_LOGO_URL` optional, defaults to `https://www.estatenest.capital/brand/enci-buildos-logo.jpeg`
- `MANAGEMENT_PROJECTS_JSON` optional if you want to override the fallback management project dataset
- `SUPABASE_URL` or `VITE_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` preferred for the BuildOS server API, with `SUPABASE_SECRET_API_KEY` supported as an alternative if your Supabase project uses the newer secret-key format
- `BUILDOS_WORKSPACE_SLUG` optional, defaults to `estate-nest-capital`

For Google Workspace or Gmail SMTP, either create an app password for `hello@estatenest.capital` and store it in `EMAIL_SMTP_PASS`, or use the Google OAuth mail variables listed above once the refresh-token path has been verified.

For shared BuildOS persistence, apply `supabase/migrations/20260417_buildos_shared_persistence.sql` before enabling the service-role storage envs in preview or production.

## GitHub and Vercel settings to apply

1. Protect `main` so direct pushes are blocked.
2. Require pull requests before merging to `main`.
3. Require the `Verify` GitHub Action to pass before merge.
4. Configure Vercel production deployments to track only `main`.
5. Use preview deployments for every non-production branch.
