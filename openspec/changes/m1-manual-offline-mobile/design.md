## Context

See `proposal.md` for motivation and `specs/manual-offline-business-journal/spec.md` for the behavioral contract. This new component repository contains only an initial README and its local OpenSpec setup. It is dispatched from central contract pin `bd55571688818a47746dae673c35d7f2a125b77e` and targets one synthetic-data Android build.

## Goals / Non-Goals

**Goals:**

- Establish a maintainable Expo/React Native Android application boundary with local-first Business Journal state.
- Make confirmed transaction persistence and local outbox identity atomic enough to prevent duplicate records from normal repeat confirmation.
- Make English/French copy, HTG formatting, deterministic tests, and an installable Android build first-class delivery evidence.

**Non-Goals:**

- No network client, authentication, backend API, cloud provider, AWS, analytics, remote storage, iOS/TestFlight, speech, text-to-speech, receipt/image capture, or OCR behavior.
- No participant data, real business data, credentials, signing material, or device identifiers in source or evidence.

## Decisions

### Expo-managed Android application with EAS-managed signing

Use an Expo-managed application configured with the approved Android identifier and an EAS internal-distribution APK profile. EAS owns the Android keystore; source holds only non-secret app/build configuration and safe install evidence.

Alternative considered: locally generated or manually managed signing keys. Rejected because the approved EAS-managed key path avoids handling key material locally for this prototype.

### SQLite is the sole durable source of truth

Use Expo-compatible SQLite storage for confirmed Business Journal and outbox records. Draft form state remains in memory until confirmation; confirmation writes the transaction and queued outbox record in one local transaction where the chosen storage API permits it.

Alternative considered: AsyncStorage or a remote-first store. Rejected because the central contract requires SQLite-backed durability and M1 excludes backend synchronization.

### Local domain model separates draft, confirmed transaction, and outbox

Model draft values separately from a confirmed transaction. A confirmed transaction has a stable UUID-style local identity, an idempotency key, confirmation timestamp/state, and user-facing local status; its linked outbox operation has its own stable operation identity and queued state. The UI derives activity and totals solely from confirmed transactions.

Alternative considered: one UI object with a mutable sync flag. Rejected because it makes cancellation, retries, restart behavior, and future idempotency ambiguous.

### Resource-based locale and money presentation

Keep visible strings in English/French resource maps and centralize HTG monetary formatting. The initial locale selection can follow device locale with an in-app deterministic testing override; all unsupported locale behavior falls back to English without blocking entry.

Alternative considered: hard-coded text or runtime translation. Rejected because hard-coded text cannot supply French evidence and runtime translation would add an unapproved network/privacy dependency.

### Proportional deterministic checks before device evidence

Use unit/component checks for validation, confirmation/cancellation, persistence/restart mapping, totals, locale resources, and outbox identity. Add a repeatable Android build/config check, then create the EAS APK for physical-device evidence. The component’s Apply evidence must name the exact commands and outcomes.

Alternative considered: rely on manual emulator verification. Rejected because it cannot prove the offline state transitions or the required installed APK behavior.

## Risks / Trade-offs

- [Expo SDK/package compatibility changes] → Pin compatible package versions in the lockfile and record the exact deterministic install/test/build commands.
- [SQLite transaction API limitations] → Test repeat confirmation and restart behavior directly; document any atomicity limitation before Verify.
- [EAS free-plan queue or build failure] → Retry within the approved free plan and record the build outcome; do not upgrade or create paid services.
- [Physical device unavailable or APK cannot install] → keep physical-device acceptance incomplete and do not claim M1 completion.
- [Locale/device behavior differs from tests] → capture synthetic Android 15 device evidence and record any divergence for central re-pin/amendment.

## Migration Plan

1. Create the Expo foundation and deterministic local-test setup on `feat/m1-manual-offline-delivery`.
2. Implement the local data model, transaction flow, localization, and local summaries with synthetic fixtures.
3. Run deterministic checks and produce the approved EAS internal-distribution APK.
4. Install and exercise the APK on the representative Android 15 device with synthetic data.
5. Verify, return the exact component evidence to the central ledger, then seek the separate component Gate-2 approval before Sync/Archive and merge.
