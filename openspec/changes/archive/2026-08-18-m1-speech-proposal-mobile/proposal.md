## Why

The Phase 1 mobile prototype proves that confirmed manual sales and expenses
survive offline in SQLite. The next approved M1 risk is whether a truthfully
disclosed synthetic speech-shaped suggestion can reuse that trusted review and
confirmation path without recording the user, contacting a provider, or
creating financial data before explicit confirmation.

This component change implements the mobile portion of central change
`prototype-speech-proposal-confirmation`, pinned at central revision
`48cb1ad511a3d578c347889e5c78e8a967c16dab`.

## What Changes

- Add a visibly disclosed deterministic prototype sample that maps `I sold
  rice for 500 gourdes today` to an editable 500 HTG sale proposal.
- Preserve the raw transcript, fixture identity, proposed values, and
  `speech_transcript` source metadata separately from confirmed transaction
  values while reusing the existing review, confirmation, SQLite, totals,
  idempotency, and outbox path.
- Add cancel, record-again, deterministic unavailable/retry, and complete
  manual-sale fallback behavior that cannot create a transaction before
  confirmation.
- Add visible and accessibly named English/French speech controls and a narrow
  device-TTS adapter for reading the visible review summary; TTS failure or
  interruption cannot mutate or block proposal or financial state.
- Resolve and record the Expo SDK 57-compatible `expo-speech` version, focused
  deterministic tests, Android configuration evidence, accessibility evidence,
  dependency/security review, rollback evidence, and the component return to
  the central linkage ledger.
- Keep any new EAS build or artifact operation behind the central task 3.1
  just-in-time approval gate.

## Capabilities

### New Capabilities

- `speech-proposal-mobile`: Mobile behavior for a truthfully disclosed local
  transcript fixture, editable speech-sourced proposal, device TTS assistance,
  failure/manual fallback, source persistence, accessibility, and evidence
  return.

### Modified Capabilities

- `manual-offline-business-journal`: Replace the Phase 1 prohibition on speech
  controls with an optional Phase 2 speech entry point while preserving the
  complete manual offline flow, Home-first behavior, and confirmation boundary.

## Impact

- **Application:** Home and review UI state, keyed English/French resources,
  transaction draft/source types, SQLite source metadata, and navigation
  cleanup behavior.
- **Dependency:** add only the Expo SDK-compatible `expo-speech` package behind
  an injected adapter; no speech-to-text, microphone, provider, backend, or
  network dependency.
- **Tests and evidence:** focused domain/storage/component tests, accessibility
  semantics, formatting/type/Jest/Android/OpenSpec/dependency/secret/scope/
  attribution/portability/recovery checks, and separately authorized Android
  build/device evidence.
- **External boundary:** the approved branch and GitHub lifecycle are scoped to
  this component change. EAS remains a later separate gate; no deployment,
  release, cloud resource, credentials, real data, iOS, receipt/OCR, or live
  speech provider is included.
- **Return:** component archive and integrated revisions, exact checks, central
  pin, divergence statement, and residual gaps return to the central
  `prototype-speech-proposal-confirmation` ledger.
