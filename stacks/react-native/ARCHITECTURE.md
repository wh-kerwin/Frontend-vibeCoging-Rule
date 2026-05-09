# React Native Architecture

Target stack: React Native with Expo unless native customization requires bare RN.

## Positioning

Use React Native for cross-platform mobile apps where iteration speed and shared TypeScript contracts matter.

## Directory Structure

```txt
app/                    # Expo Router routes
src/
  components/
    ui/
    patterns/
  features/
    account/
      api/account.api.ts
      components/AccountHeader.tsx
      hooks/useAccount.ts
      schemas/account.schema.ts
      screens/AccountScreen.tsx
  shared/
    http/
    lib/
    storage/
    theme/
  stores/
```

## UI Rules

- Use native primitives or a vetted UI kit. Avoid web-only assumptions.
- Respect safe areas, keyboard avoidance, and platform-specific gestures.
- Use `StyleSheet` or NativeWind consistently. Do not mix many styling systems without a project reason.
- Touch targets should be at least 44px.

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` (same `createHttpClient` factory as React/Vue, with `setTimeout` instead of `window.setTimeout` for RN compatibility).
- Feature API functions parse responses with Zod schemas. Components never call `fetch` directly.
- Base URL is read from `process.env.EXPO_PUBLIC_API_BASE_URL` (declared in `.env.example`).
- TanStack Query drives all server state — cancellation is handled automatically by the query client.

## Data and Offline

- Server state: TanStack Query (`useQuery`, `useMutation`).
- Secure tokens: `expo-secure-store` or `react-native-keychain` — never `AsyncStorage` for secrets.
- App preferences: `AsyncStorage` wrapper with Zod validation (see `shared/storage/preferences.ts`).
- Offline-first features need explicit sync queues and conflict rules.

## Native Boundary

All native modules get wrapped in `src/shared/native`. Feature code imports wrappers, not native libraries directly.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm expo-doctor
```

## Template Index

| File | Purpose |
|------|---------|
| `templates/react-native/tsconfig.json` | Strict TS config with `@` alias (no DOM lib) |
| `templates/react-native/.env.example` | Required env variables (`EXPO_PUBLIC_*`) |
| `templates/react-native/src/shared/http/client.ts` | `createHttpClient` factory (RN-compatible, uses global `setTimeout`) |
| `templates/react-native/src/shared/http/errors.ts` | `AppError` class + `toAppError` |
| `templates/react-native/src/shared/storage/preferences.ts` | `AsyncStorage` wrapper with Zod validation |
| `templates/react-native/src/features/account/api/account.api.ts` | API module example using shared `http` |
| `templates/react-native/src/features/account/hooks/useAccount.ts` | `useQuery` hook example |
| `templates/react-native/src/features/account/screens/AccountScreen.tsx` | Screen with loading / error / success states |

