# M1 Manual Offline Mobile Device Acceptance

Date: 2026-08-17

## Environment

- Application: `org.homerootsfoundation.reinvesttogrow`.
- APK: EAS internal-distribution build `db6deffa-27f5-43d3-8f1b-9a25fc26678b`.
- Source revision: `7466c401e45db91b917e5fda310fde4524ccb1bf`.
- Application version: `1.0.1`; Android build version: `2`.
- Device class: representative U656AC running Android 15.
- Data: synthetic sale and expense examples only.

## Owner-Executed Results

The assigned executor, Joe Rice, reported all of the following passed on the
installed replacement APK:

1. The APK installed as an update and opened successfully with the official
   temporary Home Roots Foundation logo and the Home-first manual flow.
2. In airplane mode, one synthetic sale and one synthetic expense were entered,
   reviewed, confirmed, and saved locally.
3. The expected local activity and totals were visible after confirmation.
4. The app was force-closed and reopened; all recorded synthetic transactions
   remained present.
5. French was selected and all observed labels were displayed in French.

No screenshot, device identifier, account material, or real business data is
retained with this evidence.

## Scope Notes

- The physical-device run demonstrates user-visible local status and restart
  persistence. Stable transaction/outbox identities and duplicate protection
  are additionally covered by the deterministic repository tests.
- The run does not claim live synchronization, cloud access, speech, receipt
  capture/OCR, iOS/TestFlight, or participant-data behavior.
