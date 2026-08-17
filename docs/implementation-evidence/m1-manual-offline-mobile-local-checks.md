# M1 Manual Offline Mobile Local Check Evidence

Date: 2026-08-16; amended 2026-08-17

## Completed Local Work

- Expo SDK 57 blank TypeScript foundation with Android package
  `org.homerootsfoundation.reinvesttogrow`.
- Internal-distribution APK profile in `eas.json`; the first EAS build is
  recorded separately in `m1-manual-offline-mobile-eas-build.md`.
- Synthetic English/French Home-first manual sale/expense UI with
  review/confirmation, local activity, HTG totals, and plain-language local
  status.
- `expo-sqlite` repository with confirmed transactions and linked queued outbox
  records written in one exclusive local transaction.
- Deterministic domain, restart-model, and React Native UI tests.

## Commands And Outcomes

| Command | Outcome | Coverage |
| --- | --- | --- |
| `npm run format:check` | Passed. | Component-owned TypeScript, app/EAS config, package config, and dependency evidence formatting. |
| `npm run typecheck` | Passed. | Expo application, domain, SQLite repository, and test source type safety. |
| `npm test` | Passed: 3 suites, 6 tests. | Draft validation, English/French status resources, confirmation identity, totals, restart-model outbox identity, and review-before-save UI. |
| `npm run android:config` | Passed. | Public Expo config resolves the approved Android package and SQLite/localization plugins. |
| `npx expo install --check` | Passed after aligning `@types/jest` to Expo SDK 57's compatible `29.5.14`. | SDK/package compatibility. |

## 2026-08-17 Corrective Home-Flow Check

- The initial APK installed and proved the manual local flow, but its form-first
  start screen did not reflect the selected M1 Home visual reference. Corrective
  task 2.5 changes the start route to Home, uses only functional manual sale and
  expense actions, and returns to updated Home after confirmation.
- `npm run format:check`, `npm run typecheck`, `npm test` (3 suites, 6 tests),
  `npm run android:config`, and `git diff --check` passed after that correction.
- The component test now proves the Home-first sale route, review state, and
  confirm return to Home. It does not replace fresh installed-APK visual/device
  evidence.

## Residual Gaps

- `npm audit` reports 19 upstream dependency vulnerabilities (7 moderate, 12
  high). No automatic audit fix was run because it could alter the Expo SDK
  dependency graph; assess and remediate through a separate approved dependency
  change if needed.
- npm reports an optional `fsevents` install-script review notice. It is not
  needed for the Android target and no script approval was granted.
- A corrected replacement Android APK and its physical Android 15 visual/device
  run remain pending. The previously installed APK is not source-equivalent to
  this correction. Local test doubles do not replace installed-APK persistence
  and visual evidence on the representative device.
