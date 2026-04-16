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
- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `EMAIL_SMTP_HOST` optional, defaults to `smtp.gmail.com`
- `EMAIL_SMTP_PORT` optional, defaults to `465`
- `EMAIL_SMTP_SECURE` optional, defaults to `true` when port `465`
- `EMAIL_FROM_NAME` optional, defaults to `Estate Nest Capital Inc.`
- `EMAIL_FROM_ADDRESS` optional, defaults to `EMAIL_SMTP_USER`
- `EMAIL_REPLY_TO` optional, defaults to `EMAIL_FROM_ADDRESS`
- `EMAIL_INBOX_COPY` optional, defaults to `hello@estatenest.capital`
- `EMAIL_LOGO_URL` optional, defaults to the public Estate Nest logo URL
- `MANAGEMENT_PROJECTS_JSON` optional if you want to override the fallback management project dataset

For Google Workspace or Gmail SMTP, create an app password for `hello@estatenest.capital` and store it in `EMAIL_SMTP_PASS`.

## GitHub and Vercel settings to apply

1. Protect `main` so direct pushes are blocked.
2. Require pull requests before merging to `main`.
3. Require the `Verify` GitHub Action to pass before merge.
4. Configure Vercel production deployments to track only `main`.
5. Use preview deployments for every non-production branch.
