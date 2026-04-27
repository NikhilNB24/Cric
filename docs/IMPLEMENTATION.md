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
