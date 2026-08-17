## Why

The approved central M1 contract now has a pinned, dispatched mobile component, but no Android application exists to prove that a synthetic business can record a sale or expense without a network connection. This change creates that bounded Phase-1 component outcome while keeping future cloud, speech, receipt, and iOS work out of scope.

## What Changes

- Create an Android-first Expo mobile foundation with the approved stable Android application identifier.
- Add a synthetic English/French manual Business Journal flow for sale and expense drafts, review/confirmation, recent activity, and simple local totals.
- Persist confirmed records and their sync-shaped outbox identities in SQLite-backed local storage so they remain after restart without live synchronization.
- Add deterministic component checks and EAS internal-distribution Android build evidence for the representative Android 15 device.
- Preserve the central contract pin and return evidence path; do not introduce backend, cloud, iOS, speech, receipt/OCR, or real-data behavior.

## Capabilities

### New Capabilities

- `manual-offline-business-journal`: Android-local, confirmed sale/expense capture with durable SQLite records, local activity/totals, understandable status, and sync-shaped outbox identity.

### Modified Capabilities

- None.

## Impact

- Affected systems: new Expo/React Native Android component, local SQLite persistence, localization resources, deterministic test tooling, and EAS Android build configuration.
- External boundary: the already approved personal Expo/EAS account may host one project and internal-distribution Android build; EAS-managed signing is used. No AWS, other cloud provider, backend, deployment, paid upgrade, or iOS/TestFlight action is included.
- Contract linkage: central repository `jizzoe/home-roots-reinvest-in-growth`, change `m1-manual-offline-delivery`, contract pin `bd55571688818a47746dae673c35d7f2a125b77e`.
