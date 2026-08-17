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
- [x] 2.5 Correct the manual Phase-1 flow to start on the selected M1 Home visual pattern, provide only functional sale/expense quick actions, route through entry/review/confirmation, and return to updated Home.
  - Evidence: user-confirmed scope on 2026-08-17 after installed-APK visual comparison identified the form-first implementation gap. `App.tsx` now starts on Home, routes each quick action through entry/review/confirmation, returns to Home on save, and keeps speech/receipt out of Phase 1; the updated component test and 2026-08-17 local check pass. It renders the owner-approved temporary official Home Roots asset recorded in `docs/brand-assets.md`, rather than extracting the generated logo treatment from `ai-planning/design-assets/M1/home-roots-mobile-home-screen-concept-v1.png`. Physical-device visual comparison remains task 4.2 evidence.

## 3. Deterministic Validation

- [x] 3.1 Add deterministic tests for entry validation, cancellation, confirmation, duplicate prevention, localization/HTG presentation, and summary calculations.
  - Evidence: three Jest suites cover validation, confirmation identities, French status resources, HTG totals, duplicate prevention, and review-before-save UI behavior.
- [x] 3.2 Add deterministic persistence tests proving transaction and outbox identity stability across a repository reinitialization/restart boundary.
  - Evidence: `src/storage/memoryJournalRepository.test.ts` reinitializes a repository over persistent local test storage and proves one confirmed transaction plus its stable queued outbox identity survive the boundary.
- [x] 3.3 Run formatting, type-check, test, and Android configuration/build checks; record commands, outcomes, skipped checks, and residual gaps using synthetic-only evidence.
  - Evidence: `docs/implementation-evidence/m1-manual-offline-mobile-local-checks.md` records passed formatting, type-check, Jest, Expo Android config, and SDK compatibility commands plus dependency/security and physical-device gaps.

## 4. Android Build and Evidence Return

- [x] 4.1 Create/link the approved Expo EAS project, configure EAS-managed Android signing, and submit one internal-distribution Android APK build without paid-plan upgrade or external cloud integration.
  - Evidence: EAS project `@joericearchitect/hrf-reinvest-to-grow` and EAS-managed keystore were created; Android internal-distribution build `f4cdb078-39c6-4110-9540-1b1630fc2973` finished successfully. Safe metadata, artifact-access handling, and the source-traceability gap are recorded in `docs/implementation-evidence/m1-manual-offline-mobile-eas-build.md`.
- [x] 4.2 Produce safe synthetic APK/install and device-run evidence, including offline sale/expense, restart persistence, local outbox identity, activity/totals, and English/French smoke coverage.
  - Evidence: EAS replacement build `db6deffa-27f5-43d3-8f1b-9a25fc26678b` from exact source `7466c401e45db91b917e5fda310fde4524ccb1bf` was installed on the representative Android 15 device. The owner passed airplane-mode synthetic sale/expense, French-label, force-close/reopen, activity/totals, and official-logo Home-flow checks; see `docs/implementation-evidence/m1-manual-offline-mobile-device-acceptance.md`.
- [x] 4.3 Run component Verify against every approved requirement, scenario, task, and quality constraint; correct defects within the approved budget and record evidence.
  - Evidence: `docs/implementation-evidence/m1-manual-offline-mobile-verification.md` maps all seven requirements and fifteen scenarios to deterministic checks, exact-source EAS evidence, and physical-device acceptance. No critical issue remains; the time-dependent Expo patch recommendation and upstream audit advisories are explicit residual warnings.
- [x] 4.4 Present component verification for the separate Gate-2 approval; only after approval Sync, Archive, integrate to local/remote `main`, and return the required record to the central linkage ledger.
  - Evidence: after completing the device run, the owner explicitly stated that all phone tests passed and approved M1 close-out on 2026-08-17. The approved profile is `prototype-rapid`; no isolated reviewer is required.
