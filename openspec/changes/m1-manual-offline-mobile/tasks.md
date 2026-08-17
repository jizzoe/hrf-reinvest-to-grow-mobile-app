## 1. Component Gate and Foundation

- [x] 1.1 Obtain explicit approval of this component proposal, requirements, design, repository scope, external EAS boundary, and validation plan before creating app code or EAS resources.
  - Evidence: owner approval in the session on 2026-08-16 after review of the governed component proposal, requirements, design, and tasks.
- [x] 1.2 Create and switch to `feat/m1-manual-offline-delivery`; establish the Expo-managed TypeScript foundation with non-secret Android identifier and EAS internal-distribution configuration.
  - Evidence: committed feature branch, Expo SDK 57 TypeScript foundation, `app.json` Android package `org.homerootsfoundation.reinvesttogrow`, and `eas.json` internal APK profile; `npm run android:config` passes.
- [x] 1.3 Add Expo-compatible SQLite, localization, deterministic test tooling, and locked dependency metadata; document license/source evidence and exact install/check commands.
  - Evidence: `expo-sqlite`, `expo-localization`, `expo-crypto`, Jest/RNTL, Prettier, and `package-lock.json` are installed; `docs/dependency-evidence/m1-manual-offline-mobile.md` records versions, licenses, sources, and commands.

## 2. Local Business Journal Domain

- [x] 2.1 Implement the synthetic business context, English/French resources, HTG formatter, and a deterministic locale-selection path.
  - Evidence: `App.tsx` and `src/domain/journal.ts` provide synthetic `Ti Komès Lakay`, HTG formatting, English/French resources, device-locale default, and in-app language toggle.
- [x] 2.2 Implement SQLite schema, migrations/initialization, and repositories for confirmed transactions and their linked queued outbox operations.
  - Evidence: `src/storage/journalRepository.ts` initializes durable transaction/outbox tables and writes linked confirmed/outbox records through an exclusive SQLite transaction.
- [x] 2.3 Implement draft entry, plain-language validation, review/confirmation, cancellation, and duplicate-confirmation protection for manual sales and expenses.
  - Evidence: `App.tsx` keeps drafts in memory until review/confirm; `src/domain/journal.ts` validates required values and uses stable identities; SQLite and memory repositories ignore repeated transaction identities.
- [x] 2.4 Implement recent activity, local earnings/spending/estimated-profit totals, and user-understandable local status without network behavior.
  - Evidence: the local UI derives activity and totals only from confirmed records and labels status as Saved on this phone/Waiting to sync with no network client.

## 3. Deterministic Validation

- [x] 3.1 Add deterministic tests for entry validation, cancellation, confirmation, duplicate prevention, localization/HTG presentation, and summary calculations.
  - Evidence: three Jest suites cover validation, confirmation identities, French status resources, HTG totals, duplicate prevention, and review-before-save UI behavior.
- [x] 3.2 Add deterministic persistence tests proving transaction and outbox identity stability across a repository reinitialization/restart boundary.
  - Evidence: `src/storage/memoryJournalRepository.test.ts` reinitializes a repository over persistent local test storage and proves one confirmed transaction plus its stable queued outbox identity survive the boundary.
- [x] 3.3 Run formatting, type-check, test, and Android configuration/build checks; record commands, outcomes, skipped checks, and residual gaps using synthetic-only evidence.
  - Evidence: `docs/implementation-evidence/m1-manual-offline-mobile-local-checks.md` records passed formatting, type-check, Jest, Expo Android config, and SDK compatibility commands plus dependency/security and physical-device gaps.

## 4. Android Build and Evidence Return

- [ ] 4.1 Create/link the approved Expo EAS project, configure EAS-managed Android signing, and submit one internal-distribution Android APK build without paid-plan upgrade or external cloud integration.
- [ ] 4.2 Produce safe synthetic APK/install and device-run evidence, including offline sale/expense, restart persistence, local outbox identity, activity/totals, and English/French smoke coverage.
- [ ] 4.3 Run component Verify against every approved requirement, scenario, task, and quality constraint; correct defects within the approved budget and record evidence.
- [ ] 4.4 Present component verification for the separate Gate-2 approval; only after approval Sync, Archive, integrate to local/remote `main`, and return the required record to the central linkage ledger.
