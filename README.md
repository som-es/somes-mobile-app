# somes mobile app

React Native + Expo app for [somes.at](https://somes.at)

## Setup

```bash
npm install
cp .env.example .env.local
npm start
```

Open the app on your device and either scan the QR code from the terminal.

Everything in `src/` picks up via Fast Refresh.

Expo Go not working because of SDK 56.

## Development build

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android
```

Scan the QR Code from the terminal after the build is done to install the app.

Afterwards run

```bash
npm start
```

and scan the QR Code to see the current version of the app.

## Test Submission

iOS Example:

```bash
npx eas-cli build --profile production --platform ios
npx eas-cli submit --platform ios --latest
```

Both ask for the Apple login. The first build creates the certificates and can create the
App Store Connect entry for you.

## Layout

```
src/app/          expo-router routes, file-based
  (tabs)/         home, abstimmungen, abgeordnete, profil
src/types/        wire types, re-exported from @som-es/somes-ts
src/theme/        colors, layout, typography, party colors
src/components/   ui/ primitives, plus one folder per screen area
src/lib/          somes client, auth, favorites, query client, filter building, dates
```

Every request goes through [@som-es/somes-ts](https://github.com/som-es/somes-ts).
`src/lib/somes.ts` configures it once — base url, parliament, and the token in
expo-secure-store — and is the only place allowed to talk to the API directly. The
gaps the library still has are listed in `MISSING_FEATURES.md` in that repository.
