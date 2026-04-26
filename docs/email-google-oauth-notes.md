# ENCI BuildOS Email OAuth Notes

Internal setup note captured during local BuildOS work. This is not a production-ready checklist and should be validated again before rollout.

## Google OAuth client

- Client ID: `290261775439-sacqa0dibmkj47g1f97m6ud7d5fp74ts.apps.googleusercontent.com`

## Repo reality check

- The current ENCI BuildOS repo does **not** yet contain a live `api/google/callback` handler.
- The mailer now supports Google OAuth-style credentials at runtime, but it expects those credentials to already exist in environment variables.
- That means Google callback URLs are still important for obtaining or rotating a refresh token, but today they are **configuration notes**, not proof that an in-app callback flow exists.

## App callback URLs captured from working setup

Use these only if we later add an app-owned Google callback flow under `/api/google/callback`.

- `https://www.estatenest.capital/api/google/callback`
- `https://dashenciprojectenci-git-main-estate-nest-capital-s-projects.vercel.app/api/google/callback`
- `https://dashenciprojectenci-nqpyn0xwa-estate-nest-capital-s-projects.vercel.app/api/google/callback`

## Supabase auth redirect URL

This is the callback that matters if Google auth is being handled by Supabase Auth instead of a custom ENCI callback route.

- `https://tugwibtwyjhrzjyobzrw.supabase.co/auth/v1/callback`

## What most likely needs maintenance

- `https://www.estatenest.capital/api/google/callback`
  - keep only if we actually build the ENCI-owned callback route
- `https://dashenciprojectenci-git-main-estate-nest-capital-s-projects.vercel.app/api/google/callback`
  - reasonable to keep as the stable main-branch preview callback if you want preview testing
- `https://dashenciprojectenci-nqpyn0xwa-estate-nest-capital-s-projects.vercel.app/api/google/callback`
  - this is deployment-specific and will become stale as preview deployments change
- `https://tugwibtwyjhrzjyobzrw.supabase.co/auth/v1/callback`
  - keep if Supabase-managed Google auth remains part of the setup

## Current BuildOS mail env path

For the current server-side ENCI BuildOS mailer, the practical env set is:

- `EMAIL_SMTP_USER`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- optional: `GOOGLE_OAUTH_REDIRECT_URI`

These values must exist in the Vercel project for the deployment that is sending mail.
Client ID alone is not enough for live server-side sending. ENCI BuildOS also needs the Google OAuth client secret and a refresh token for the `hello@estatenest.capital` mailbox, then the deployment must be redeployed so the new values are picked up.

If you stay with app-password SMTP instead, the simpler path remains:

- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`

## Build note

The current ENCI BuildOS mailer path still expects runtime environment variables to be present on the deployment. If the system is moved from SMTP-only behavior toward Google OAuth-assisted delivery, re-validate:

- Vercel environment variables
- Supabase auth redirect handling
- callback route behavior under preview and production domains
- sender identity / mailbox ownership for `hello@estatenest.capital`

## Local BuildOS env names now supported

The mailer code now accepts either:

- SMTP/app-password style
  - `EMAIL_SMTP_USER`
  - `EMAIL_SMTP_PASS`

- Google OAuth-style mail transport
  - `EMAIL_SMTP_USER`
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GOOGLE_OAUTH_REFRESH_TOKEN`

Optional aliases are also accepted for the Google OAuth values.

## Reminder

Do not treat this document as evidence that production email is fully configured. It is only a preserved implementation note for the next controlled email pass.
