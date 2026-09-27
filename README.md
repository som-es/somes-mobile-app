# somes mobile app

React Native + Expo client for [somes.at](https://somes.at) - an app for following the Austrian National
Council and European Parliament: votes, delegates, motions, and decrees.

Built with [Expo Router](https://docs.expo.dev/router/introduction/), TypeScript, and
[`@som-es/somes-ts`](https://github.com/som-es/somes-ts).

## Requirements

- Node.js (LTS) and npm
- Xcode (for iOS) and/or Android Studio (for Android) if building locally, or an
  [EAS](https://docs.expo.dev/build/introduction/) account for cloud builds
- A physical device is recommended - push notifications can't be tested in a simulator/emulator

## Getting started

```bash
npm install
cp .env.example .env.local
npm start
```

`npm start` runs the Expo dev server in dev-client mode. Open it from a simulator or device that already
has a development build installed (see below) - plain Expo Go doesn't support this project's native
modules. Everything under `src/` picks up via Fast Refresh.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `https://somes.at` | Backend base URL. Point this at a local `somes-api` instance during backend development. |
| `EXPO_PUBLIC_OVERRIDE_QUESTIONS` | `false` | Development flag for the Fragen (questions) feature. |
| `EXPO_PUBLIC_MOCK_QUESTIONS` | `false` | Serves mock question data instead of calling the backend. |

## Development build

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android
```

Scan the QR code printed after the build finishes to install it on your device, then run `npm start` and
scan the dev-server QR code to load the current code.

## Creating a release build

```bash
npx eas-cli build --profile production --platform ios
npx eas-cli submit --platform ios --latest
```

Both commands prompt for your Apple credentials. The first production build for a given app creates the
signing certificates and, if needed, the App Store Connect entry automatically.

## Project layout

```
src/app/          expo-router routes, file-based
  (tabs)/         home, abstimmungen, abgeordnete, profil
src/types/        wire types, re-exported from @som-es/somes-ts
src/theme/        colors, layout, typography, party colors
src/components/   ui/ primitives, plus one folder per screen area
src/lib/          somes client, auth, favorites, query client, filter building, dates
```

## Documentation

- [`docs/index.md`](docs/index.md) - routing map and how the app talks to the backend
- [`docs/push-notifications.md`](docs/push-notifications.md) - the push notification payload contract
  `somes-api` must implement

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the Expo dev server (dev-client mode) |
| `npm run start:clear` | Same, clearing the Metro cache |
| `npm run ios` / `npm run android` | Build and run a local native app |
| `npm run web` | Run the web build |
| `npm run lint` | Lint the project |
| `npm test` / `npm run test:watch` | Run the Jest test suite |
