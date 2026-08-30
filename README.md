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
## Layout

```
src/app/          expo-router routes, file-based
  (tabs)/         home, abstimmungen, abgeordnete, profil
src/api/          endpoints
src/types/        API response types
src/theme/        colors, layout, typography, party colors
src/components/   ui/ primitives, plus one folder per screen area
src/lib/          auth, favorites, query client, filter building, dates
```
