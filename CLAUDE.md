@AGENTS.md

# somes-mobile-app

React Native + Expo (SDK 57) app for [somes.at](https://somes.at) — Austrian parliamentary data:
votes, ministerial drafts, and members of the Nationalrat. iOS and Android.

**The UI is in German.** Code, comments and commit messages are in English.

## Ground rule: somes-core is the reference

`../somes-core/` is the monorepo holding the Rust backend (`somes-api`) and the SvelteKit web app
(`somes-frontend`). **Before writing any code that talks to the backend, read how the web app does
it.** This app mirrors that structure deliberately so the two stay diffable.

| Need | Read first |
|---|---|
| An API call | `somes-core/somes-frontend/src/lib/api/api.ts`, `.../authed.ts` |
| A response type | `somes-core/somes-frontend/src/lib/types.ts` |
| What an endpoint actually returns | `somes-core/somes-api/src/routes/` |
| An icon or logo | `somes-core/somes-frontend/src/lib/assets/` |
| Where the palette came from | `somes-core/somes-frontend/src/routes/layout.css` |

Do not invent an endpoint, a field name, or a party colour. If it isn't in somes-frontend or
somes-api, it doesn't exist yet — say so rather than guessing.

## Architecture

```
src/app/          expo-router routes (file-based)
  (tabs)/         the four tabs: index, abstimmungen, abgeordnete, profil
  abgeordnete/[id].tsx   member detail, pushed over the tabs
  notifications.tsx      the header bell's target
src/api/          client.ts (fetch core), api.ts (public), authed.ts (JWT)
src/types/        ported verbatim from somes-frontend/src/lib/types.ts
src/theme/        colors, layout, typography, party-colors
src/components/   layout/ (header, tab bar), ui/ (Card, Badge, …)
src/lib/          auth-store, query-client, push
src/assets/       SVGs copied from somes-frontend
```

## The design: Figma is the source of truth for visuals

File `uduxjzE9617QtjpHanZQF8` ("somes-Web"), read through the Framelink Figma MCP. The five mobile
frames:

| Screen | Node |
|---|---|
| Home | `286:2` |
| Abstimmungen / Ministerialentwürfe | `286:276` |
| Abgeordnete | `233:4534` |
| Abgeordnete Detail | `286:437` |
| Benutzerprofil | `286:657` |

Frames are 393pt wide with 20pt gutters. `layout.css` explains where the palette came from, but
**where the two disagree the Figma wins** — the header is `#2D3748`, not `surface-500`.

Two things that are easy to get wrong and are wrong in the screenshots' first reading:

- **Filter pills are 12pt rounded rectangles, not pills.** Only the peach metadata badges are fully
  round. Party and topic chips are also 12pt, 22pt tall — use `Chip`, not `FilterPill`.
- **The active tab highlight is `rgba(255,255,255,0.1)`**, a faint white disc, not a solid accent one.

The Figma frames also contain the iPhone mockup — 48px rounded device corners, a drawn status bar,
a home-indicator bar. That is not app UI; safe-area insets handle it.

**SVG caveat:** react-native-svg does not apply `<style>` CSS blocks. `somes-mark.svg` and
`somes-icon.svg` style themselves that way and will render wrong if used as-is; flatten their
classes into presentation attributes first. `somes-wordmark.svg` and the `assets/icons` set already
use inline attributes and are safe — colour them with the `fill` / `stroke` props.

**Font:** the Figma specifies Segoe UI, which is Microsoft-proprietary and absent from both mobile
platforms. We follow the web frontend, which uses plain `system-ui` and bundles no font files, so
the app uses the system font (SF Pro / Roboto). Segoe's weight 350 "Semilight" maps to `'300'`.
Don't reopen this without a licensing answer.

## Conventions

**Errors are values, not exceptions.** Every API function returns `Promise<T | HasError>` and never
throws — the same contract as the web app. Narrow with `isHasError()`. Inside a react-query
`queryFn`, wrap with `unwrap()` so react-query gets a rejection to drive its error state.

```ts
const result = await latest_vote_results();
if (isHasError(result)) return;
// result is VoteResult[] here
```

**Data fetching is react-query.** It replaces the web app's hand-rolled persisted caches in
`somes-frontend/src/lib/caching/`, which exist to work around SvelteKit's load semantics. Query keys
are kebab-case arrays: `['delegate', id]`.

**Party colours come from the API** via `usePartyColor()` / `usePartyColors()`, which wrap the
`parties` endpoint. Never hardcode one — the parties change.

**Styling is `StyleSheet` plus the tokens in `src/theme/`.** No CSS framework. Reach for the semantic
aliases in `colors` (`colors.chrome`, `colors.card`, `colors.accent`) rather than raw ramp values
like `surface[500]`, so a design change lands in one place. The ramps are lineage; `colors`,
`radius`, `spacing` and `typography` are the design.

**Light mode only.** The design is a single light theme; `useColorScheme` branching would be dead
code. `app.json` pins `userInterfaceStyle: "light"`.

**The tab bar is custom, not `NativeTabs`.** The design needs a navy bar with a circular highlight
behind the active icon, which the platform tab bar cannot produce — and a JS bar guarantees iOS and
Android match. See `src/components/layout/tab-bar.tsx`.

## Known backend gaps

1. **Push notifications do not exist in somes-api.** It only knows email preferences
   (`MailSendInfo`). There is no device-token table and no endpoint. `src/lib/push.ts` fetches a real
   Expo token and is wired up to `POST v1/user/push_token`, but that call is disabled behind
   `PUSH_TOKEN_ENDPOINT_EXISTS` until the backend lands. Do not remove the guard without adding the
   endpoint.
2. **OAuth has no mobile redirect.** The web flow redirects to
   `https://somes.at/resolve_token?token=…`. Supporting the app needs `OAUTH_REDIRECT_URI` in
   somes-api to accept the `somesmobileapp://` scheme. Email/password login works today.

## Commands

```bash
npm start           # dev server (then scan the QR with Expo Go)
npm run ios
npm run android
npx tsc --noEmit    # typecheck
npx expo-doctor     # dependency health — keep this at 20/20
npx eas-cli build   # eas-cli via npx; do not add it as a dependency
```

`EXPO_PUBLIC_API_URL` sets the backend (defaults to `https://somes.at`). See `.env.example`.

## Do not commit or push

Leon handles all commits and pushes himself. Leave finished work staged or unstaged — never run
`git commit` or `git push`, and never add a `Co-Authored-By` trailer.
