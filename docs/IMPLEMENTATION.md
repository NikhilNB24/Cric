# CRIC Implementation Log

This file tracks implementation work as it is added to the project.

## 2026-04-27

### Backend Auth Foundation

- Added a Prisma-backed database service module for shared PostgreSQL access.
- Added Firebase Admin initialization using `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_PATH`.
- Added an auth module that verifies Firebase ID tokens from `Authorization: Bearer <token>`.
- Added backend authorization lookup against the local `users` table.
- Added `GET /me` to return the active local app user for a verified Firebase phone number.
- Added a seed script for creating the first `SUPER_ADMIN` user by phone number.
- Seeded local `SUPER_ADMIN` user `+918310827940` with active status.

### Mobile Auth Foundation

- Added Firebase client initialization from Expo public environment variables.
- Added a typed backend API helper for `GET /me`.
- Added a Zustand auth store for the current CRIC user and Firebase ID token.
- Added an OTP auth service boundary for sending/verifying Firebase phone OTP and exchanging the ID token with the backend.

### Admin User Management

- Added role metadata and a roles guard for protected backend routes.
- Added `GET /users` for `SUPER_ADMIN` users to list local app users.
- Added `POST /users` for `SUPER_ADMIN` users to onboard approved phone numbers.
- Added `PATCH /users/:id` for `SUPER_ADMIN` users to update name, role, or active status.
- Added basic request validation for E.164 phone numbers, roles, statuses, and duplicate phone numbers.

### Tournament Setup APIs

- Added a tournaments backend module for MVP setup data.
- Added `GET /tournaments`, `POST /tournaments`, and `GET /tournaments/:id`.
- Added `GET /tournaments/:id/teams` and `POST /tournaments/:id/teams`.
- Added `GET /teams/:id/players` and `POST /teams/:id/players`.
- Restricted tournament/team/player creation to `SUPER_ADMIN` and `TOURNAMENT_ADMIN`.
- Added validation for required names, optional E.164 player phone numbers, duplicate team/player names, and 11-player team maximum.

### Match Setup APIs

- Added a matches backend module for match creation and lifecycle controls.
- Added `GET /matches`, `GET /matches/:id`, and `POST /matches`.
- Added `POST /matches/:id/start`, `/pause`, `/resume`, and `/complete`.
- Restricted match creation to `SUPER_ADMIN` and `TOURNAMENT_ADMIN`.
- Restricted match lifecycle actions to `SUPER_ADMIN`, `TOURNAMENT_ADMIN`, and `SCORER`.
- Added validation for 3-15 overs, two different teams, same-tournament teams, and minimum 4 players per team.

### Scoring Foundation APIs

- Added a scoring backend module for innings setup and ball-by-ball scoring.
- Added `GET /matches/:id/scorecard`.
- Added `POST /matches/:id/innings` to start a match innings.
- Added `POST /innings/:id/balls` to submit a scored delivery with idempotency protection.
- Added `POST /innings/:id/undo-last-ball` for simple current-innings correction.
- Added innings total updates for runs, extras, wickets, and legal balls.
- Added match score snapshot refreshes after innings start, ball submission, and undo.

### Scoring Rule Hardening

- Added validation that striker, non-striker, dismissed player, and bowler exist.
- Added validation that batting players belong to the batting team and the bowler belongs to the bowling team.
- Added validation that striker and non-striker must be different players.
- Added automatic innings completion when max overs are reached or the batting team is all out.
- Added automatic chase completion for the second innings when the target is passed.
- Added match completion when the second innings completes.
- Added undo behavior that reopens a completed innings or match when the last ball is removed.
- Added focused scorer validation tests so invalid ball inputs fail before database writes.

Why:

- Scoring is the highest-risk workflow in the app because each ball changes match state, score snapshots, and completion rules.
- Player/team validation prevents impossible scorecards, such as a bowler from the batting team or duplicate striker/non-striker.
- Automatic innings and chase completion keeps match state consistent for viewers without requiring the scorer to manually end normal innings.
- Undo reopening keeps scorer correction practical while preserving the remaining ball event history.
