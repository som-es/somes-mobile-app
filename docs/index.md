# Somes App - Developer documentation

Developer-facing documentation for the somes mobile app (React Native + Expo, [somes.at](https://somes.at)).
See the [README](../README.md) for setup and build instructions - this document covers how the app is
structured once it's running: routing and backend communication.

## Quick start

- Node.js (LTS) and npm
- A development build installed on a simulator or physical device (see the README's *Development build*
  section) - plain Expo Go does not support this project's native modules (push notifications, secure
  storage)
- A physical device if you're working on push notifications; tokens cannot be requested from a
  simulator/emulator

```bash
npm install
cp .env.example .env.local
npm start
```

`npm start` runs `expo start --dev-client` and prints a QR code / dev-server URL to connect your
installed development build to. Everything under `src/` picks up via Fast Refresh.

## Routes

Routing is [expo-router](https://docs.expo.dev/router/introduction/), file-based under `src/app/`.
`src/app/_layout.tsx` defines the root stack; `(tabs)` is a route group (doesn't affect the URL) holding
the bottom-tab navigator (`src/app/(tabs)/_layout.tsx`).

| Route | Screen |
|---|---|
| `(tabs)/index` | Home |
| `(tabs)/abstimmungen` | Votes list |
| `(tabs)/abgeordnete` | Delegates list |
| `(tabs)/fragen` | Questions list |
| `(tabs)/profil` | Profile / settings |
| `abgeordnete/[id]` | Delegate profile |
| `abgeordnete/[id]/reden` | All speeches by a delegate |
| `abstimmung/[gp]/[ityp]/[inr]` | Vote / initiative detail |
| `abstimmung/[gp]/[ityp]/[inr]/reden` | All speeches for a vote |
| `abstimmung/[gp]/[ityp]/[inr]/durchsuchen` | Named (roll-call) vote search |
| `rede/[id]` | Single speech detail |
| `ministerialentwurf/[gp]/[inr]` | Ministerial draft detail |
| `verordnung/[risId]` | Decree detail |
| `frage/[id]` | Question detail |
| `frage/neu` | Ask a new question |
| `favoriten/abstimmungen` | Favorited votes |
| `favoriten/personen` | Favorited delegates |
| `anmelden` | Sign in |
| `resolve_token` | OAuth redirect target (see below) |
| `notifications` | Notification settings |
| `impressum` | Legal notice |

`gp`/`ityp`/`inr` identify a parliamentary initiative (legislative period, initiative type, initiative
number); their exact format is country-dependent - see *Communication with the Backend*.

Push notifications deep-link into a subset of these routes (`abstimmung`, `ministerialentwurf`,
`verordnung`, `abgeordnete`) - see [push-notifications.md](./push-notifications.md) for the payload
contract that drives that.

## Communication with the Backend

Every request goes through [`@som-es/somes-ts`](https://github.com/som-es/somes-ts), a shared,
generated-ish API client. `src/lib/somes.ts` is the only place allowed to configure or reach around it:
base URL (`EXPO_PUBLIC_API_URL`, defaults to `https://somes.at`), the active country, and where the auth
token lives.

- **Dual region.** The app is Austrian/EU dual-region: `country` is `"at"` or `"eu"`, persisted in
  `AsyncStorage`, and baked into the client at construction - switching region rebuilds the whole
  `SomesClient` (`src/lib/use-country.ts`) rather than mutating a field. `useSwitchCountry()` also calls
  `queryClient.resetQueries()`, so no screen has to guard against stale cross-region cache data. Nearly
  every endpoint is scoped `/api/{country}/v1/...`, and identifiers that look similar across regions
  (e.g. legislative period `gp`) are **not interchangeable** - AT uses Roman numerals (`"XXVIII"`), EU
  uses plain numbers (`"10"`).
- **Auth.** The JWT is stored via `expo-secure-store` behind the library's `TokenStore`, loaded once at
  startup before any request can fire (`src/app/_layout.tsx`). Google sign-in opens a system browser
  (`src/lib/oauth.ts`) - somes-api performs the OAuth exchange itself and redirects back to the app's
  custom scheme (`somesmobileapp://resolve_token`) carrying a finished token, not an auth code. While the
  app is foregrounded, the session silently renews at most once an hour; a token the server actively
  rejects signs the user out and clears the query cache, but a network failure alone does not.
- **Locale vs. region.** UI language (`src/lib/use-locale.ts`) is a separate concern from `country` - it's
  an i18next language switch with no query-cache invalidation, since almost no cached API response is
  itself locale-dependent (only rendered UI text is). The one notable exception is delegate Q&A content
  and topic names, which the API translates on request - see the topic-coloring notes in
  `src/theme/topic-groups.ts` if you're touching that area.
- **Caching.** `src/lib/query-client.ts` configures TanStack Query with a 5-minute `staleTime`
  (parliamentary data changes in days, not seconds), a single retry, and no refetch-on-window-focus (React
  Native has no such event).
- **Errors.** The client throws `ApiError`; `src/lib/somes.ts` exposes narrow predicates
  (`isAuthError`, `isRateLimited`, `signUpFlags`) for the handful of cases the UI special-cases instead
  of showing a generic error.

## Localization (i18n)

Translations live under `src/i18n/locales/<locale>/<namespace>.json` and are wired up in
`src/i18n/index.ts` (side-effect import, run once at the top of the root layout, before anything reads
`i18n.language`) and `src/i18n/resources.ts`, which statically imports every locale/namespace pair into
one `resources` object handed to `i18next.init()`.

- **Supported locales.** Two: `de-AT` (default/fallback) and `en-GB`. Adding a third means updating
  `Locale` in `src/lib/locale.ts`, `supportedLngs` in `src/i18n/index.ts`, and adding a matching
  `src/i18n/locales/<locale>/` directory with every namespace file `resources.ts` expects - a missing
  namespace file breaks the import, not just a missing key.
- **Namespaces.** One JSON file per screen area (`common`, `home`, `votes`, `delegates`, `profile`,
  `auth`, `favorites`, `notifications`, `filters`, `impressum`, `questions`), matching `NAMESPACES` in
  `src/i18n/resources.ts`. Components call `useTranslation('<namespace>')` and read keys with `t(...)`;
  `common` is the default namespace for anything not tied to one screen area.
- **Reading/setting the locale.** `src/lib/locale.ts` is the source of truth for *persistence* -
  `loadLocale()` reads the stored choice (falling back to the device locale via `expo-localization`,
  `de*` -> `de-AT`, everything else -> `en-GB`) and is called once at startup alongside
  `loadToken`/`loadCountry`; `setLocale()` calls `i18n.changeLanguage()` and persists the choice to
  `AsyncStorage`. i18next itself (`i18n.language`) is the source of truth for the *active* locale -
  `src/lib/use-locale.ts` exposes `useLocale()`/`useSwitchLocale()` as thin, react-i18next-backed
  wrappers shaped like `useCountry()`/`useSwitchCountry()` for call-site parity (e.g. `LanguageSheet` next
  to `CountrySheet`), even though the underlying state doesn't live in `AsyncStorage`/React state the way
  `country` does.
- **No cache interaction.** Unlike `useSwitchCountry()`, switching locale never calls
  `queryClient.resetQueries()` - react-i18next re-renders every `useTranslation()` consumer on change, and
  (per *Communication with the Backend*) no cached query data is itself locale-dependent.
- **Testing.** Import `@/test/i18n` (side effect) in any test that renders a component using
  `useTranslation()`; it initializes the same shared i18next instance via `@/i18n` and resets it to
  `en-GB` before each test so locale state doesn't leak between test files.

## Push notifications

Push is a separate, self-contained contract between the mobile app and `somes-api`, documented in full in
[**push-notifications.md**](./push-notifications.md): the payload shape the backend must send, how it
maps to the routes above, and how to test a send without needing a backend change. The app-side pieces
are `src/components/push-registrar.tsx` (registration), `src/lib/notification-target.ts` (payload → route
mapping), and `src/components/push-router.tsx` (tap handling).

## References

- [Expo documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [expo-router](https://docs.expo.dev/router/introduction/)
- [Expo push notifications overview](https://docs.expo.dev/push-notifications/overview/)
- [expo-notifications SDK reference](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [@som-es/somes-ts](https://github.com/som-es/somes-ts) - the shared API client
- [push-notifications.md](./push-notifications.md) - this repo's push notification backend contract
