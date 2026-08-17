## 1. Component Gate and Foundation

- [ ] 1.1 Obtain explicit approval of this component proposal, requirements, design, repository scope, external EAS boundary, and validation plan before creating app code or EAS resources.
- [ ] 1.2 Create and switch to `feat/m1-manual-offline-delivery`; establish the Expo-managed TypeScript foundation with non-secret Android identifier and EAS internal-distribution configuration.
- [ ] 1.3 Add Expo-compatible SQLite, localization, deterministic test tooling, and locked dependency metadata; document license/source evidence and exact install/check commands.

## 2. Local Business Journal Domain

- [ ] 2.1 Implement the synthetic business context, English/French resources, HTG formatter, and a deterministic locale-selection path.
- [ ] 2.2 Implement SQLite schema, migrations/initialization, and repositories for confirmed transactions and their linked queued outbox operations.
- [ ] 2.3 Implement draft entry, plain-language validation, review/confirmation, cancellation, and duplicate-confirmation protection for manual sales and expenses.
- [ ] 2.4 Implement recent activity, local earnings/spending/estimated-profit totals, and user-understandable local status without network behavior.

## 3. Deterministic Validation

- [ ] 3.1 Add deterministic tests for entry validation, cancellation, confirmation, duplicate prevention, localization/HTG presentation, and summary calculations.
- [ ] 3.2 Add deterministic persistence tests proving transaction and outbox identity stability across a repository reinitialization/restart boundary.
- [ ] 3.3 Run formatting, type-check, test, and Android configuration/build checks; record commands, outcomes, skipped checks, and residual gaps using synthetic-only evidence.

## 4. Android Build and Evidence Return

- [ ] 4.1 Create/link the approved Expo EAS project, configure EAS-managed Android signing, and submit one internal-distribution Android APK build without paid-plan upgrade or external cloud integration.
- [ ] 4.2 Produce safe synthetic APK/install and device-run evidence, including offline sale/expense, restart persistence, local outbox identity, activity/totals, and English/French smoke coverage.
- [ ] 4.3 Run component Verify against every approved requirement, scenario, task, and quality constraint; correct defects within the approved budget and record evidence.
- [ ] 4.4 Present component verification for the separate Gate-2 approval; only after approval Sync, Archive, integrate to local/remote `main`, and return the required record to the central linkage ledger.
