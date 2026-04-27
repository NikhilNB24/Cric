# CRIC Local Environment Setup

This document lists everything that must be installed locally before development starts.

Stack:

- Mobile app: Expo, React Native, TypeScript, Tamagui
- Auth: Firebase Auth Phone OTP
- Backend: Node.js, NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma

---

## 1) Install Checklist

Install these on your machine:

| Tool | Required | Why |
| --- | --- | --- |
| Node.js LTS 20+ | Yes | Runs backend, Expo tooling, Prisma, and package scripts. |
| npm 10+ | Yes | Installs project dependencies. |
| Git | Yes | Source control and dependency tooling. |
| PostgreSQL 15+ | Yes | Local app database. |
| Firebase project | Yes | Phone OTP and Firebase ID tokens. |
| Java JDK 17 | Recommended | Needed by Android tooling if using emulator/builds. |
| Android Studio | Recommended | Android emulator and SDK tools. |
| Expo Go mobile app | Recommended | Fastest way to run the mobile app on a phone. |
| VS Code | Optional | Recommended editor. |
| Postman or Insomnia | Optional | Useful for testing backend APIs. |

---

## 2) Install Node.js and npm

1. Download Node.js LTS from:

```text
https://nodejs.org
```

2. Choose the LTS installer for Windows.
3. Keep the default options during installation.
4. Open a new PowerShell window.
5. Verify:

```powershell
node -v
npm -v
```

Expected:

```text
node >= 20.x
npm >= 10.x
```

### Fix Missing npm Roaming Folder

If npm fails with an error like:

```text
ENOENT: no such file or directory, lstat 'C:\Users\<you>\AppData\Roaming\npm'
```

Create the folder:

```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\npm"
```

Then retry the npm or npx command.

---

## 3) Install Git

1. Download Git for Windows:

```text
https://git-scm.com/download/win
```

2. Install with default options.
3. Open a new PowerShell window.
4. Verify:

```powershell
git --version
```

---

## 4) Install PostgreSQL

1. Download PostgreSQL for Windows:

```text
https://www.postgresql.org/download/windows/
```

2. Use the EDB installer.
3. During install:
   - Install PostgreSQL Server.
   - Install pgAdmin if you want a GUI.
   - Keep port `5432`.
   - Set a password for the `postgres` admin user.
   - Remember this password.

4. Verify in a new PowerShell window:

```powershell
psql --version
```

### If `psql` Is Not Recognized

Add PostgreSQL `bin` to your Windows PATH.

Typical path:

```text
C:\Program Files\PostgreSQL\16\bin
```

Steps:

1. Open Windows Search.
2. Search `Environment Variables`.
3. Open `Edit the system environment variables`.
4. Click `Environment Variables`.
5. Under your user variables, select `Path`.
6. Click `Edit`.
7. Add PostgreSQL `bin` path.
8. Open a new PowerShell window.
9. Run:

```powershell
psql --version
```

---

## 5) Create Local PostgreSQL Database

Open PowerShell:

```powershell
psql -U postgres
```

Enter the PostgreSQL password you created during installation.

Inside `psql`, run:

```sql
CREATE USER cric_user WITH PASSWORD 'cric_password';
CREATE DATABASE cric_local OWNER cric_user;
GRANT ALL PRIVILEGES ON DATABASE cric_local TO cric_user;
\q
```

Local database URL:

```text
postgresql://cric_user:cric_password@localhost:5432/cric_local?schema=public
```

---

## 6) Install Android Studio

Install Android Studio if you want to run the app in an Android emulator.

Download:

```text
https://developer.android.com/studio
```

During setup:

1. Install Android SDK.
2. Install Android SDK Platform Tools.
3. Install Android Emulator.
4. Create a virtual device.

Verify:

```powershell
adb version
```

If `adb` is not recognized, add platform tools to PATH.

Typical path:

```text
C:\Users\<you>\AppData\Local\Android\Sdk\platform-tools
```

Using a physical phone with Expo Go is simpler for early development.

---

## 7) Install Expo Go on Phone

Install **Expo Go** from:

- Google Play Store for Android
- Apple App Store for iOS

This lets you scan the QR code from `npx expo start`.

---

## 8) Firebase Project Setup

Create the Firebase project:

1. Open:

```text
https://console.firebase.google.com
```

2. Create project, for example:

```text
cric-local
```

3. Go to `Authentication`.
4. Click `Get started`.
5. Enable `Phone` provider.
6. Add test phone numbers for local development.

Example:

```text
Phone: +911234567890
OTP: 123456
```

Use Firebase test numbers locally to avoid SMS quota/cost during development.

### Firebase Web App Config for React Native

In Firebase Console:

1. Project settings.
2. Add app.
3. Choose Web app.
4. Copy config values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`

These go into `mobile/.env`.

### Firebase Admin SDK for Backend

In Firebase Console:

1. Project settings.
2. Service accounts.
3. Generate new private key.
4. Save JSON outside the repo.

Example local path:

```text
C:\Users\<you>\firebase\cric-service-account.json
```

Never commit this JSON file.

---

## 9) Install Global Development CLIs

Install NestJS CLI and EAS CLI:

```powershell
npm install -g @nestjs/cli eas-cli
```

Verify:

```powershell
nest --version
eas --version
```

Expo can be run through `npx expo`, so a global Expo CLI is not required.

---

## 10) Repository Layout

Target layout:

```text
CRIC_/
  mobile/
  backend/
  docs/
  CRIC_PRD.md
  LOCAL_ENV_SETUP.md
```

Create folders:

```powershell
mkdir mobile
mkdir backend
mkdir docs
```

---

## 11) Backend Setup

Create NestJS project:

```powershell
cd backend
nest new .
```

Choose npm when prompted.

Install backend dependencies:

```powershell
npm install @nestjs/config firebase-admin prisma @prisma/client
npm install -D prisma
```

Initialize Prisma:

```powershell
npx prisma init
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://cric_user:cric_password@localhost:5432/cric_local?schema=public
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=C:\Users\<you>\firebase\cric-service-account.json
CORS_ORIGIN=http://localhost:8081
```

After Prisma schema is added:

```powershell
npx prisma format
npx prisma migrate dev --name init
npx prisma generate
```

Run backend:

```powershell
npm run start:dev
```

Expected API:

```text
http://localhost:3000
```

---

## 12) Mobile App Setup

Create Expo app:

```powershell
cd ..
cd mobile
npx create-expo-app@latest . --template blank-typescript
```

Install mobile dependencies:

```powershell
npm install firebase @tanstack/react-query zustand
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install tamagui @tamagui/config @tamagui/babel-plugin
npm install react-native-svg @expo/vector-icons
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Android emulator may need:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

Physical device needs your computer LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
```

Run app:

```powershell
npx expo start
```

---

## 13) Local Auth Flow

Expected flow:

1. User enters phone number in mobile app.
2. Firebase sends/verifies OTP.
3. Mobile app receives Firebase ID token.
4. Mobile app calls backend `GET /me`.
5. Backend verifies token with Firebase Admin SDK.
6. Backend checks `users.phone_number` and `users.status`.
7. Backend returns local app role and profile.

Request header:

```text
Authorization: Bearer <firebase_id_token>
```

For first testing, seed an admin user in PostgreSQL with the same phone number used in Firebase test auth.

---

## 14) Useful Commands

Backend:

```powershell
cd backend
npm run start:dev
npx prisma studio
npx prisma migrate dev
npm run test
```

Mobile:

```powershell
cd mobile
npx expo start
npx expo start --clear
npm run lint
```

Prisma Studio:

```text
http://localhost:5555
```

---

## 15) Files to Ignore

Add to `.gitignore`:

```gitignore
backend/.env
mobile/.env
*.local
*.log
node_modules/
dist/
.expo/
.turbo/
```

Never commit:

- Firebase service account JSON
- `.env` files
- database dumps with real phone numbers

---

## 16) Setup Verification Checklist

- `node -v` works.
- `npm -v` works.
- `git --version` works.
- `psql --version` works.
- PostgreSQL database `cric_local` exists.
- Firebase Phone Auth is enabled.
- Firebase test phone number is configured.
- Firebase Admin SDK JSON is saved outside repo.
- `nest --version` works.
- `eas --version` works.
- Backend starts on port `3000`.
- Prisma connects to PostgreSQL.
- Expo app starts with `npx expo start`.
- Mobile app can call backend health endpoint.
- Backend can verify Firebase ID token.

