# Push notifications — backend contract

How `somes-api` sends push notifications to the somes mobile app, and what the `data`
payload must contain for a tap to open the right screen.

The app side is implemented. This document is the contract the sender has to meet.

- Device registration: `src/components/push-registrar.tsx`, `src/lib/push.ts`
- Payload parsing and route mapping: `src/lib/notification-target.ts`
- Tap handling: `src/components/push-router.tsx`

## Background

The app is an Austrian/EU parliamentary tracker. It is dual-region: `country` is
`"at"` or `"eu"`, and nearly every endpoint is scoped as `/api/{country}/v1/...`. The
region is persisted on device and the whole API client is rebuilt when it changes.

Notifications are Expo push notifications. The device registers an Expo push token
(`ExponentPushToken[...]`) with somes-api, and somes-api sends through Expo's service
rather than talking to FCM/APNs directly.

## Endpoints the app already calls

All authenticated with the user's JWT. `{country}` is the app's active region.

| Method | Path | Body / query | Returns |
|---|---|---|---|
| `POST` | `/api/{country}/v1/user/push_notifications/token` | `{ "push_token": string, "platform": "ios"\|"android"\|"web" }` | — |
| `DELETE` | `/api/{country}/v1/user/push_notifications/token` | `{ "push_token": string }` | — |
| `GET` | `/api/{country}/v1/user/push_notifications/tokens` | — | `PushTokenInfo[]` |
| `GET` | `/api/{country}/v1/user/push_notifications/settings` | `?platform=` | `NotificationSettings` |
| `PUT` | `/api/{country}/v1/user/push_notifications/settings` | `NotificationSettings` | — |

```ts
interface PushTokenInfo {
  push_token: string;
  platform: "ios" | "android" | "web";
  enabled: boolean;
}

interface NotificationSettings {
  platform: "ios" | "android" | "web";
  send_new_vote_results: boolean;
  send_new_vote_result_by_favo: boolean;
  send_new_delegate_activity: boolean;
  send_new_ministrial_prop: boolean;
  send_new_ministrial_prop_by_favo: boolean;
  send_new_decree: boolean;
  send_new_decree_by_favo: boolean;
  send_new_proposal: boolean;
  send_new_proposal_by_favo: boolean;
}
```

Email preferences are a parallel set of the same nine categories with a `_mails`
suffix, served from `/api/{country}/v1/user/send_mail_info`. They are unrelated to
push and must not gate a push send.

## Sending a notification

```http
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json
Accept-Encoding: gzip, deflate
```

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Neues Abstimmungsergebnis",
  "body": "Antrag auf Änderung des Klimaschutzgesetzes wurde angenommen.",
  "channelId": "default",
  "sound": null,
  "data": {
    "type": "vote",
    "country": "at",
    "gp": "XXVIII",
    "ityp": "A",
    "inr": 123,
    "category": "send_new_vote_result_by_favo"
  }
}
```

Required message fields:

- **`channelId: "default"`** — mandatory on Android. `"default"` is the only channel
  the app creates (`src/lib/push.ts`). Android silently drops notifications sent to a
  channel that does not exist.
- **`sound: null`** — the app's foreground handler sets `shouldPlaySound: false`.
  Sending a sound would be inconsistent between foreground and background.
- `title` / `body` — user-facing German copy. The app displays these verbatim; it does
  not build its own text from `data`.

Expo caps a single message at 4 KiB.

## The `data` payload

`data` is what the app reads on tap. It is a tagged union: `type` selects the
destination screen, and the remaining fields are that screen's route parameters.

`country` is required on every variant. `category` is optional.

### `type: "vote"`

Opens `/abstimmung/{gp}/{ityp}/{inr}`. Backs all four vote-and-motion categories.

```json
{ "type": "vote", "country": "at", "gp": "XXVIII", "ityp": "A", "inr": 123 }
```

| Field | Type | Notes |
|---|---|---|
| `gp` | string | Legislative period. `"XXVIII"` in AT, `"10"` in EU. |
| `ityp` | string | Initiative type — `"A"` (Antrag), `"RV"` (Regierungsvorlage), etc. |
| `inr` | number | Initiative number. |

Resolves against `GET /api/{country}/v1/vote_results/{gp}/{ityp}/{inr}`.

> Do **not** send a `vote_result_id` instead. The app's vote route is keyed on the
> `{gp, ityp, inr}` triple; there is no route that accepts the integer id, even though
> that id is what bookmarks use.

### `type: "ministerial_proposal"`

Opens `/ministerialentwurf/{gp}/{inr}`.

```json
{ "type": "ministerial_proposal", "country": "at", "gp": "XXVIII", "inr": 44 }
```

| Field | Type | Notes |
|---|---|---|
| `gp` | string | Legislative period. |
| `inr` | number | Proposal number. |

No `ityp` — a ministerial draft is always `ME` and the app hardcodes it. Sending
`ityp` anyway is harmless; it is ignored.

Resolves against `GET /api/{country}/v1/gov_proposals/{gp}/{inr}`.

### `type: "decree"`

Opens `/verordnung/{ris_id}`.

```json
{ "type": "decree", "country": "at", "ris_id": "BGBLA_2026_II_262" }
```

| Field | Type | Notes |
|---|---|---|
| `ris_id` | string | Rechtsinformationssystem identifier. Send raw and unescaped — the app URL-encodes it. |

Resolves against `GET /api/{country}/v1/decrees/ris_id/{ris_id}`.

### `type: "delegate"`

Opens `/abgeordnete/{id}`.

```json
{ "type": "delegate", "country": "eu", "id": 7 }
```

| Field | Type | Notes |
|---|---|---|
| `id` | number | Delegate id. |

For `send_new_delegate_activity` this is the **delegate whose activity it is** — not
the vote they voted on or the proposal they filed. The tap opens their profile.

### Shared fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `country` | `"at"` \| `"eu"` | yes | See below. |
| `category` | string | no | The `NotificationSettings` key that triggered the send. Not used for routing. |

**`country` is not optional.** `gp` values collide across regions (AT uses roman
numerals, EU uses integers), so without it the app can fetch an EU item against the AT
API. On a mismatch with the device's current region, the app switches region and
clears its cache before navigating.

`inr` and `id` may be sent as JSON numbers or strings — the app coerces to string
either way.

## Category → variant

The German UI labels invert what the English field names suggest. `send_new_proposal`
means **Anträge** (parliamentary motions, which are vote results), *not*
Ministerialentwürfe. Map accordingly:

| Category | `type` |
|---|---|
| `send_new_vote_results` | `vote` |
| `send_new_vote_result_by_favo` | `vote` |
| `send_new_proposal` | `vote` |
| `send_new_proposal_by_favo` | `vote` |
| `send_new_ministrial_prop` | `ministerial_proposal` |
| `send_new_ministrial_prop_by_favo` | `ministerial_proposal` |
| `send_new_decree` | `decree` |
| `send_new_decree_by_favo` | `decree` |
| `send_new_delegate_activity` | `delegate` |

## Sending rules

1. **Filter by settings.** For each candidate recipient, send only if the
   `NotificationSettings` boolean for that category is `true` for that user and
   platform.
2. **Filter by token state.** Send only to tokens with `enabled: true`.
3. **Batch.** Expo accepts up to 100 messages per request; send an array instead of a
   single object.
4. **Read receipts.** The send response returns ticket ids; poll
   `POST https://exp.host/--/api/v2/push/getReceipts` afterwards. On a
   `DeviceNotRegistered` error, delete that token — it will never work again.
   `MessageRateExceeded` should be retried with backoff.
5. **Region.** Tokens are registered under a country-scoped path, so a token's region
   is whichever one was active when it was registered. Set `data.country` to the
   region the *item* belongs to, which is not necessarily the token's.

## Forward compatibility

The app ignores any payload it cannot parse and opens normally rather than erroring —
this includes an unknown `type`, a missing `country`, and a variant missing a required
field. New `type` values can therefore ship on the backend before the app release that
handles them, at the cost of those taps not deep-linking on older builds.

## Testing without the backend

Push tokens require a **physical device**; the token request returns `unsupported` on
a simulator or emulator.

1. Read the device's token from the app's notification settings screen, or from the
   `POST .../push_notifications/token` call it makes on launch.
2. Send a test message with Expo's tool at <https://expo.dev/notifications>, or curl
   `https://exp.host/--/api/v2/push/send` with one of the payloads above.
3. Check all three tap states per variant — app in foreground, app backgrounded, and
   app fully killed. The killed case is the one that exercises the app's
   navigator-readiness guard.
4. Cross-region: with the app set to AT, send a payload with `"country": "eu"` and
   confirm it switches region and loads rather than 404-ing.
