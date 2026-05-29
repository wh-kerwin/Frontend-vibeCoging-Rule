# React Native Architecture

Default stack and version pins live in `workflows/matrices/react-native.matrix.md`. Default runtime is Expo unless a native customization forces bare RN.

## Positioning

Use React Native for cross-platform mobile apps where iteration speed and shared TypeScript contracts matter.

## Directory Structure

```txt
app/                    # Expo Router routes (file-based; one route per file)
src/
  components/
    ui/                 # tamagui / native primitives, depending on matrix
    patterns/
  features/
    <feature>/
      api/<feature>.api.ts
      components/<Feature><Surface>.tsx
      hooks/use<Feature>.ts
      schemas/<feature>.schema.ts
      screens/<Feature>Screen.tsx
  shared/
    http/                # from shared/snippets/http/client.rn.ts (uses global setTimeout)
    lib/
    storage/             # AsyncStorage wrapper — from shared/snippets/storage/preferences.rn.ts
    theme/
    native/              # native module wrappers — feature code imports these, not the modules directly
  stores/                # only when a global store is selected
```

See `boundaries/common/directory-rules.md` for the cross-stack rules.

## UI Rules

- Use native primitives or a vetted UI kit (matrix default: native primitives + NativeWind). Avoid web-only assumptions.
- Respect safe areas, keyboard avoidance, and platform-specific gestures.
- Use `StyleSheet` or NativeWind consistently. Do not mix many styling systems without a project reason.
- Touch targets must be at least 44px — applies to buttons, list rows, tap-to-dismiss areas, everything.
- See `boundaries/common/encapsulation.md` for the cross-stack component contract.

## HTTP

- All requests use the `http` singleton from `src/shared/http/client.ts` — the RN variant of `createHttpClient` from `shared/snippets/http/client.rn.ts` (uses global `setTimeout`; there is no `window` in RN).
- Feature API functions parse responses with Zod schemas. Components never call `fetch` directly.
- Base URL is read from `process.env.EXPO_PUBLIC_API_BASE_URL` (declared in `.env.example`). Per the cross-stack rule in `boundaries/common/coding-style.md`, this happens in one typed module (`src/config/env.ts`), not throughout feature code.
- TanStack Query (when selected) drives all server state and handles cancellation automatically.
- See `boundaries/common/http-contract.md`.

## Data and Offline

- Server state: TanStack Query (`useQuery`, `useMutation`).
- Secure tokens: `expo-secure-store` or `react-native-keychain` — **never `AsyncStorage` for secrets**.
- App preferences: `AsyncStorage` wrapper with Zod validation (the snippet in `shared/snippets/storage/preferences.rn.ts`).
- Offline-first features need explicit sync queues and conflict resolution rules. Document them in the feature's README before implementation.

## Native Boundary

All native modules get wrapped in `src/shared/native`. Feature code imports the wrapper, not the native library. This keeps mocking, platform-specific behavior, and version migration in one place.

```ts
// src/shared/native/camera.ts — wrapper
import { Camera as ExpoCamera } from 'expo-camera'
export const camera = { /* typed methods */ }

// feature code
import { camera } from '@/shared/native/camera'
```

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm expo-doctor
```

## Generate a Project

Run `/new-project` (Claude Code) or follow `workflows/new-project.md`. Stack defaults in `workflows/matrices/react-native.matrix.md`.
