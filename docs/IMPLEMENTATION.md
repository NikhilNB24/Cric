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

### Viewer Refresh APIs

- Added a viewer backend module for lightweight refresh-based score screens.
- Added `GET /viewer/matches/live` for in-progress and paused matches.
- Added `GET /viewer/matches/recent` for the latest matches.
- Added `GET /viewer/matches/:id/live-score` for a compact match score view.
- Reused `match_score_snapshots` so viewer refreshes do not need to load every ball event.

Why:

- MVP viewers only need fresh data when opening or manually refreshing a screen, so snapshot-based reads keep the backend simple and cheap.
- Separating viewer endpoints from scorer/admin setup endpoints makes it easier to keep payloads small and permissions clear.
- The compact live-score endpoint gives mobile a stable target before automatic live updates are introduced.

### Mobile App Shell

- Reworked the mobile home screen into a three-tab app shell: Live, Score, and Admin.
- Added a live-match viewer preview that mirrors the viewer refresh APIs.
- Added scorer-focused innings, player, ball input, submit, and undo surfaces.
- Added admin setup previews for tournaments, teams, matches, and user approval.
- Kept Firebase phone sign-in visible above the workflow tabs.
- Split the app shell into ES module components, constants, and shared styles instead of keeping all UI code in `App.tsx`.

Why:

- The backend API surface is broad enough to begin shaping the mobile workflows around real product tasks.
- The tab shell gives each role a clear area without introducing navigation complexity before API wiring is complete.
- Mocked data lets us verify layout, information density, and control placement before binding screens to live backend data.
- Smaller components make the UI easier to wire to APIs, test, and evolve screen-by-screen.

### Mobile API Client Layer

- Added a shared API request helper that attaches Firebase bearer tokens and normalizes backend errors.
- Added typed client helpers for auth, viewer, users, tournaments, teams, players, matches, innings, ball submission, and undo.
- Wired the Live tab to TanStack Query calls for `/viewer/matches/live` and `/viewer/matches/recent`.
- Kept mock viewer data as a fallback when the user is not signed in or no API data is available.
- Wired the Admin tab to fetch user/tournament counts when signed in.
- Added Admin tab mutations for approving a viewer and creating a tournament.
- Added Admin tab mutations for creating teams, adding players, and creating matches behind temporary demo IDs.
- Wired the Scorer tab ball buttons to ball submission and undo mutations.
- Added temporary Expo public demo IDs for tournament, team, match setup, innings, striker, non-striker, and bowler so API calls can be tested once setup data exists.

Why:

- A single API layer keeps screen components focused on UI state instead of repeated fetch boilerplate.
- Typed helpers mirror the backend routes and reduce wiring mistakes as screens become interactive.
- Viewer wiring is the lowest-risk first integration because it is read-only and matches the MVP manual-refresh model.
- Admin wiring is the next-lowest-risk write path because user approval and tournament creation are simple, isolated setup actions.
- Team/player/match creation now exists in the UI without requiring full picker screens, which keeps API wiring moving while preserving a clear path to replace demo IDs.
- Scorer wiring starts behind explicit demo IDs so the UI can be exercised without pretending match/player selection is finished.

### Local Developer Command

- Added a root `npm.cmd run dev` command that starts the backend and Expo mobile dev server together.
- Added `scripts/dev.ps1` to launch backend and mobile from one IDE terminal.
- Added the missing `babel-preset-expo` mobile dev dependency required by `mobile/babel.config.js`.
- Imported `UsersModule` into tournament, match, scoring, and viewer backend modules so their local `FirebaseAuthGuard` providers can resolve `UsersService`.
- Updated `scripts/dev.ps1` to run backend and mobile as background jobs with prefixed logs in the same IDE terminal.
- Redirected backend and Expo stderr into the same prefixed terminal log stream so warnings do not stop the combined dev command.
- Added `npm.cmd run dev:web` to start backend plus Expo web on `http://localhost:19006` without needing the interactive Expo `w` shortcut.
- Added Expo web runtime dependencies `react-dom` and `react-native-web` so the mobile app can run in a laptop browser.
- Added the missing `@tamagui/native` package required by Tamagui's web bundle path.
- Ignored generated `.tamagui/` cache output.
- Updated the web dev command to clear Metro cache on startup.
- Ignored the temporary `.expo-web-test/` export verification output.
- Filtered Expo web bundle progress repaint lines from the combined dev terminal output.
- Replaced Tamagui runtime buttons with a small React Native `AppButton` component.
- Removed the Tamagui provider from `App.tsx`.
- Removed unused Tamagui dependencies, Babel plugin configuration, and Tamagui config file.
- Simplified the mobile home screen so match stats, scoring, and admin tabs are shown only after sign-in.
- Added player career stats storage with per-match stat rows and aggregate career stat rows.
- Added `POST /player-stats/matches/:id/recalculate` for scorer/admin-driven career stat updates after a completed match.
- Added `GET /player-stats/players/:id` and `GET /player-stats/leaderboard` read endpoints.
- Added optional `fielderId` on scored ball events for caught dismissals.
- Updated career stat recalculation to credit catches to the recorded fielder, or to the bowler for caught-and-bowled dismissals.
- Added a reusable mobile `NumberSelector` for constrained numeric setup fields.
- Replaced match overs text entry with a plus/minus selector.
- Added a players-in-team selector to guide team roster setup.
- Added a local development OTP bypass that accepts any entered OTP and signs in with a `dev-local:<phone>` token.
- Added backend support for `dev-local:<phone>` bearer tokens outside production by resolving the phone number against active local users.
- Expanded local CORS support to include Expo web at `http://localhost:19006`.
- Replaced the signed-in tab strip with a hamburger menu for Profile, Matches, Stats, Score, and Admin.
- Added a mobile Stats screen that searches players by name or phone number and displays selected career stats.
- Added `GET /player-stats/players?query=...` for player stat lookup.

Why:

- A single command reduces local startup friction and keeps backend/mobile startup paths consistent across development sessions.
- Explicitly installing the Expo Babel preset prevents Android bundling from failing when Metro loads the project Babel config.
- Nest resolves guard dependencies from the module where the guard is provided, so each guarded feature module needs visibility into the exported user lookup service.
- Keeping both dev server logs in one terminal makes startup failures easier to see and avoids extra PowerShell windows while working inside the IDE.
- Expo compatibility warnings should be visible to the developer, but they should not be treated as fatal PowerShell job errors.
- The combined terminal log mode cannot pass keypresses into Expo, so a direct web command gives laptop testing a reliable non-interactive path.
- Expo requires the web renderer packages before `expo start --web` can serve the app locally.
- Tamagui's main package imports its native bridge during web bundling, so the matching package must be installed with the rest of the Tamagui family.
- Generated Tamagui cache files should stay out of source control because they are rebuilt locally.
- Clearing Metro cache avoids stale failed web bundles after dependency fixes.
- The one-shot web export output is only a local verification artifact.
- Expo's progress bar uses terminal repaint characters that render poorly through PowerShell background jobs, while the actual warnings and errors remain useful.
- The current UI only needs simple buttons, and removing Tamagui from the render path avoids duplicate package instance crashes during Expo web testing.
- Removing unused Tamagui tooling keeps Metro from loading stale plugin/config paths and reduces the web bundle size.
- The first screen should stay focused on authentication before exposing role-specific match workflows.
- Per-match stat rows make career stat recalculation idempotent and correction-friendly because a match can be recalculated without double-counting.
- Career stat reads give the app a stable API target for player profiles and leaderboards.
- Capturing `fielderId` at scoring time gives the backend enough data to calculate fielding career stats from the ball-event ledger.
- Numeric match and roster setup values should be selected from valid ranges instead of typed freely.
- Local browser/device testing should not be blocked on Firebase verifier setup while core workflows are still being built.
- The bypass still requires the phone number to exist as an active backend user and is disabled when `NODE_ENV=production`.
- Expo web runs from a different localhost origin than Metro native, so the backend must allow both local origins.
- Player stats should be discoverable by users without knowing internal player IDs.
