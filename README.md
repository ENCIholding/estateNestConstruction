# ENCI App

Management and business operations dashboard for Estate Nest Capital Inc. built with React, TypeScript, Vite, Tailwind CSS, and Vercel.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Vercel

## Current Status

This project is being migrated away from Base44.

Completed so far:
- Frontend pages renamed and migrated to `Management...` structure
- Forms migrated to local Vercel app structure
- Authentication utilities created
- Vite config cleaned up
- Tailwind and TypeScript configs cleaned up

Still in progress:
- Replacing Base44-backed API routes
- Building or wiring the real backend data layer
- Final deployment cleanup and testing

## Project Structure

```text
src/
  components/
  pages/
  assets/
  hooks/
  lib/

api/
  _lib/
  management/
  login.ts
  logout.ts
  session.ts
