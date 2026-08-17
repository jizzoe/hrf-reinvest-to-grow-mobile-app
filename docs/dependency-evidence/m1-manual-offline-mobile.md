# M1 Manual Offline Mobile Dependency Evidence

Date: 2026-08-16

## Approved Dependencies

| Dependency                      | Installed version | License | Purpose                                                           | Source                     |
| ------------------------------- | ----------------- | ------- | ----------------------------------------------------------------- | -------------------------- |
| `expo`                          | `57.0.13`         | MIT     | Expo-managed Android application runtime.                         | Expo SDK package metadata. |
| `expo-sqlite`                   | `57.0.1`          | MIT     | Durable Android-local SQLite Business Journal and outbox storage. | Expo SDK package metadata. |
| `expo-localization`             | `57.0.1`          | MIT     | Device-locale default for English/French resource selection.      | Expo SDK package metadata. |
| `expo-crypto`                   | `57.0.1`          | MIT     | Stable local transaction/outbox identity generation.              | Expo SDK package metadata. |
| `jest-expo`                     | `57.0.4`          | MIT     | Expo-compatible deterministic Jest environment.                   | npm package metadata.      |
| `@testing-library/react-native` | `14.0.1`          | MIT     | React Native component behavior checks.                           | npm package metadata.      |
| `prettier`                      | `3.9.6`           | MIT     | Deterministic formatting check.                                   | npm package metadata.      |

## Commands

```bash
npm run format:check
npm run typecheck
npm test
npm run android:config
npx eas-cli@latest build --platform android --profile preview
```

The last command is intentionally deferred until the approved code and local
checks are complete. It uses the approved EAS free-plan, internal-distribution
APK route and EAS-managed Android signing. No cloud service, backend, or paid
upgrade is introduced by these dependencies.
