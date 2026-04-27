# CRIC Setup Status

Updated: 2026-04-27

## Completed

- Initialized local Git repository and pushed it to GitHub.
- Created `backend/` NestJS TypeScript project.
- Created `mobile/` Expo React Native TypeScript project.
- Installed backend dependencies for config, Firebase Admin, Prisma, and PostgreSQL client generation.
- Installed mobile dependencies for Firebase, TanStack Query, Zustand, React Navigation, Tamagui, SVG, and Expo icons.
- Initialized Prisma under `backend/prisma`.
- Added environment examples for backend and mobile.
- Added repository-level ignore rules for local env files, logs, build outputs, Expo state, and dependencies.

## Local Machine Items Still Needed

- PostgreSQL is not currently available on PATH as `psql`.
- Docker is not currently available on PATH as `docker`.
- Firebase project values still need to be copied into local `.env` files.
- Firebase Admin service account JSON should be saved outside the repo.

## Next Commands

Backend:

```powershell
cd backend
npm.cmd run start:dev
```

Mobile:

```powershell
cd mobile
npm.cmd run start
```
