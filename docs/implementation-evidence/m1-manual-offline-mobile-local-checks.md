# M1 Manual Offline Mobile Local Check Evidence

Date: 2026-08-16

## Completed Local Work

- Expo SDK 57 blank TypeScript foundation with Android package
  `org.homerootsfoundation.reinvesttogrow`.
- Internal-distribution APK profile in `eas.json`; no EAS project/build has been
  created at the time of this local-evidence record.
- Synthetic English/French manual sale/expense UI with review/confirmation,
  local activity, HTG totals, and plain-language local status.
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

## Residual Gaps

- `npm audit` reports 19 upstream dependency vulnerabilities (7 moderate, 12
  high). No automatic audit fix was run because it could alter the Expo SDK
  dependency graph; assess and remediate through a separate approved dependency
  change if needed.
- npm reports an optional `fsevents` install-script review notice. It is not
  needed for the Android target and no script approval was granted.
- A generated Android APK, EAS project/build evidence, and physical Android 15
  device run remain pending. Local test doubles do not replace SQLite evidence on
  the named physical device.
