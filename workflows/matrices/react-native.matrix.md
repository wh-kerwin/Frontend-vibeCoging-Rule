# React Native Project Matrix

Drives the generation step of `workflows/new-project.md` for the React Native stack. Stage 1's `atomic_css` question is filtered to RN-applicable options only (`nativewind` or `none`).

## Identifier

`react-native`

## Version baseline (as of 2026-05)

- React Native 0.79.x (Expo SDK 53)
- Expo 53.x
- React 19.2.x
- TypeScript 5.8.x
- Node 22 LTS

## Defaults

| Dimension | Default |
|---|---|
| `runtime` | `expo` |
| `ui_library` | `native-primitives` |
| `atomic_css` | `nativewind` |
| `routing` | `expo-router` |
| `state` | `zustand` |
| `data` | `tanstack-query` |
| `forms` | `react-hook-form+zod` |
| `tests` | `vitest+jest-preset` |
| `animation` | `react-native-reanimated` |
| `icons` | `lucide-react-native` |
| `secure_storage` | `expo-secure-store` |

## Choices

### Choices.runtime

#### `expo` (default)
- `deps`: `expo ^53.0`, `react ^19.2`, `react-native 0.79.x`
- `dev_deps`: `@expo/cli` (transitive via expo)
- `writes`: `app.json`, `babel.config.js`, `metro.config.js`

#### `bare`
- Standard React Native CLI scaffold. More setup, only choose when native customization needs it.

### Choices.ui_library

#### `native-primitives` (default)
- `deps`: none beyond RN core.
- Use `View`, `Text`, `Pressable`, `ScrollView`, etc. Build patterns in `src/components/`.

#### `tamagui`
- `deps`: `tamagui ^1.121`, `@tamagui/config ^1.121`
- `writes`: `tamagui.config.ts`

#### `gluestack`
- `deps`: `@gluestack-ui/themed ^1.1`

### Choices.atomic_css

#### `nativewind` (default)
- `deps`: `nativewind ^4.1`
- `dev_deps`: `tailwindcss ^4.3`
- `writes`: `tailwind.config.js` (NativeWind requires the v3-style config even with Tailwind 4 — confirmed in NativeWind docs as of 2026-05), `babel.config.js` plugin

#### `none`
- `StyleSheet.create` only. No utility CSS.

### Choices.routing

#### `expo-router` (default)
- `deps`: `expo-router ^4.0`
- `writes`: `app/_layout.tsx`, `app/index.tsx`, `app/+not-found.tsx`
- File-based routing under `app/` at repo root.

#### `react-navigation`
- `deps`: `@react-navigation/native ^7.0`, `@react-navigation/native-stack ^7.0`, `react-native-screens`, `react-native-safe-area-context`
- `writes`: `src/app/Navigator.tsx`

### Choices.state

Same options as React: `zustand` (default) / `jotai` / `redux-toolkit` / `none`. Same dep ranges.

### Choices.data

#### `tanstack-query` (default)
- `deps`: `@tanstack/react-query ^5.100`
- `writes`: `src/app/providers/QueryProvider.tsx` (adapt from `shared/snippets/query/QueryProvider.tsx` — same code; only the import location of `AppError` changes)

#### `fetch-only`
- No additional deps.

### Choices.forms

Same as React: `react-hook-form+zod` (default) or `none`.

### Choices.tests

#### `vitest+jest-preset` (default)
- `dev_deps`: `vitest ^4.1`, `jest-expo ^53.0` (for Expo helpers), `@testing-library/react-native ^13.0`
- `writes`: `vitest.config.ts` with `jest-expo` preset

#### `jest-only`
- `dev_deps`: `jest`, `jest-expo`. Skip vitest.

### Choices.animation

#### `react-native-reanimated` (default)
- `deps`: `react-native-reanimated ^4.0`
- `writes`: babel plugin entry `react-native-reanimated/plugin`

#### `none`
- Use RN's `Animated` API.

### Choices.secure_storage

#### `expo-secure-store` (default — expo runtime only)
- `deps`: `expo-secure-store ^14.0`
- For auth tokens.

#### `react-native-keychain`
- `deps`: `react-native-keychain ^9.2`
- Works for bare RN; also for Expo with a dev client.

**Never store secrets in `AsyncStorage`.** That is for preferences only.

## Universal writes (every RN project)

| Path | Source |
|---|---|
| `package.json` | Assembled; includes Expo scripts (`expo start`, `expo prebuild`, etc.) |
| `app.json` | Inline minimal Expo config |
| `babel.config.js` | Inline, includes selected plugins (NativeWind, Reanimated) |
| `metro.config.js` | Inline default |
| `tsconfig.json` | `shared/snippets/config/tsconfig.strict.json` minus `"DOM"`/`"DOM.Iterable"` libs; add `"jsx": "react-jsx"` |
| `eslint.config.js` | `shared/snippets/config/eslint.flat.ts.js` + `eslint-plugin-react-hooks` block |
| `.env.example` | `shared/snippets/config/env.example` with `%API_BASE_VAR%` → `EXPO_PUBLIC_API_BASE_URL` |
| `app/_layout.tsx` | Inline — providers + Stack/Drawer setup |
| `src/shared/http/client.ts` | `shared/snippets/http/client.rn.ts` (uses global `setTimeout`) |
| `src/shared/http/errors.ts` | `shared/snippets/http/errors.client.ts` |
| `src/shared/storage/preferences.ts` | `shared/snippets/storage/preferences.rn.ts` |
| `src/shared/native/.gitkeep` | Empty — directory for native module wrappers |
| `src/config/env.ts` | Inline — typed wrapper around `process.env.EXPO_PUBLIC_*` |

## Post-init CLI

| Choice | Command | Mode |
|---|---|---|
| always | `<pm> install` | auto |
| `runtime: expo` | `<pm> dlx expo install` (resolves SDK-aligned versions of native packages) | auto |
| `runtime: expo` first run | `<pm> exec expo start` | announce (user runs manually to open dev client) |

## Feature exemplar (show inline; do not auto-write)

For each feature requested:

- `src/features/%FEATURE_NAME%/schemas/%FEATURE_NAME%.schema.ts` — Zod schema
- `src/features/%FEATURE_NAME%/api/%FEATURE_NAME%.api.ts` — `get%FeatureName%(id, init?)`
- `src/features/%FEATURE_NAME%/hooks/use%FeatureName%.ts` — `useQuery({...})` with signal threading
- `src/features/%FEATURE_NAME%/components/%FeatureName%Header.tsx` — presentational
- `src/features/%FEATURE_NAME%/screens/%FeatureName%Screen.tsx` — handles loading / empty / error / success; respects safe areas and 44px touch targets per `boundaries/react-native/ARCHITECTURE.md`
