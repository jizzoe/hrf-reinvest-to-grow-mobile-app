# M1 Manual Offline Mobile EAS Build Evidence

Date: 2026-08-16

## Result

- EAS project: `@joericearchitect/hrf-reinvest-to-grow`.
- EAS project ID: `85d7d86a-ee85-4b82-85ef-8a6b7e26eb48`.
- Build ID: `f4cdb078-39c6-4110-9540-1b1630fc2973`.
- Result: `FINISHED` Android internal-distribution APK.
- Build profile: `preview`; `distribution: internal`; Android APK build type.
- Android application identifier: `org.homerootsfoundation.reinvesttogrow`.
- Signing: EAS generated and manages the Android keystore; no signing material
  was recorded locally.
- Build fingerprint: `a19bd440fcf2656bad45f02d86fc3f216e703a9e`.
- Expiration: 2026-08-31.

## Distribution And Safety

The APK artifact URL was supplied directly to the authorized owner, not written
to this public repository. Share it only with authorized synthetic-data
prototype testers. It is not participant, pilot, production, iOS, backend, AWS,
or other cloud-provider evidence.

## Traceability Gap

EAS uploaded the current uncommitted workspace at build submission, but its
metadata reports the preceding bootstrap commit
`557b4fde7fd242342f21330c6d64255364aaaa29`. The finalized implementation was
subsequently committed at `b92046f318db642e8d21ad877a8f989a751e33b5`. Treat the
EAS fingerprint above—not the displayed Git commit—as the only available build
content correlation for this first APK. A future reproducibility build must be
submitted from a clean, committed exact head under a separately approved build
action.

## Replacement Build — Home Flow And Official Temporary Logo

Date: 2026-08-17

- Build ID: `db6deffa-27f5-43d3-8f1b-9a25fc26678b`.
- Result: `FINISHED` Android internal-distribution APK.
- Build profile: `preview`; `distribution: internal`; Android APK build type.
- Android application identifier: `org.homerootsfoundation.reinvesttogrow`.
- App version: `1.0.1`; Android build version: `2`.
- Build fingerprint: `ba5ae59ae4efef1cc5e27b7ebce65db0d2b9acdd`.
- Exact source revision: `7466c401e45db91b917e5fda310fde4524ccb1bf`
  (`[M1] Use official temporary Home Roots logo`).
- Source coverage: Home-first routing, two functional Phase-1 actions, and the
  official Home Roots Foundation temporary PNG at
  `assets/brand/home-roots-foundation-logo-temporary.png`.
- Signing: the existing EAS-managed Android keystore was used; no signing
  material was recorded locally.
- Expiration: 2026-08-31.

This replacement corrects the first build's source-traceability gap: EAS
metadata names the exact committed source revision that was uploaded. As with
the first APK, the artifact URL is provided directly to the authorized owner
and is not committed to this public repository.

## Pending Human Acceptance

The owner must install the replacement APK on the representative Android 15 device and
record synthetic manual sale/expense, restart persistence, local outbox/status,
activity/totals, and English/French smoke evidence. Until then the physical-
device requirement and component Verify remain incomplete.
