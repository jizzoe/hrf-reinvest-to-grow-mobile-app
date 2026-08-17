## Context

See `proposal.md` for motivation and the two delta specs for behavior. The
existing Expo SDK 57 app keeps one in-memory draft, confirms through
`makeConfirmedTransaction`, and writes a transaction and outbox row atomically
to SQLite. It has keyed English/French copy and a scrollable Home/entry/review
UI, but transaction types and schema contain no source context and the app has
no TTS dependency.

The newer approved central pin
`48cb1ad511a3d578c347889e5c78e8a967c16dab` narrows the older Phase 1
repository policy by authorizing only this synthetic speech-proposal slice. It
does not authorize live speech, EAS, backend, cloud, real data, or deployment.

## Goals / Non-Goals

**Goals:**

- Put deterministic sample success and failure behind a replaceable local
  transcript adapter and keep the UI truthful about its behavior.
- Reuse the existing draft, validation, confirmation, transaction, totals, and
  outbox flow while retaining original proposal/source metadata.
- Isolate Expo Speech behind an injected TTS interface so deterministic tests
  prove that callbacks cannot mutate financial state.
- Preserve visible, scroll-reachable, accessibly named English/French controls
  and a complete manual path.

**Non-Goals:**

- General natural-language parsing, microphone/audio capture, speech-to-text,
  cloud TTS, translation, backend/network access, receipt/OCR, authentication,
  analytics, iOS/TestFlight, EAS work, deployment, or production use.
- Making audio output an accessibility substitute or saving a provisional
  transaction before confirmation.

## Decisions

### Represent speech as proposal context on the existing draft path

Add an optional proposal context to the draft containing source type, fixture
ID, raw transcript, and immutable original proposed fields. Confirmation copies
that context into optional transaction source metadata while confirmed amount,
date, category, and note continue to come from the reviewed draft. Manual
drafts carry no speech context.

Alternative: create a separate speech transaction type or provisional row.
Rejected because it would duplicate validation/outbox logic or blur the
proposal-versus-authoritative-record boundary.

### Migrate SQLite with nullable source columns

Initialization will inspect the existing `journal_transactions` columns and
add nullable `source_type`, `source_fixture_id`, `source_raw_input`, and
`source_proposed_values` columns when absent. Existing Phase 1 rows remain
valid manual records, while new speech-confirmed rows persist source metadata
without a second transaction table. Proposed values use deterministic JSON
serialization over a fixed local object; no untrusted SQL or executable input
is introduced.

Alternative: replace the database or use a separate source table. Replacement
would risk Phase 1 records; a separate table adds joins and lifecycle complexity
that this one-source prototype does not need.

### Use deterministic adapters with explicit UI states

A local transcript adapter returns either the known fixture or an unavailable
result. App state distinguishes speech start, sample processing, review, and
failure; `Record again` discards context and returns to start. Stable test IDs
cover each state. No timer, permission, network, or environment-dependent
recognizer is used.

Alternative: embed the fixture directly in button handlers. Rejected because a
small adapter keeps the provider boundary replaceable and failure behavior
independently testable.

### Wrap Expo Speech behind a minimal injected interface

Install the SDK-compatible `expo-speech` version through `npx expo install
expo-speech`, record the exact lockfile resolution and package license, and
wrap `speak` and `stop`. UI unmount/screen changes stop speech. Error and done
callbacks update only transient assistive status; they never call confirmation
or repository methods. Jest mocks the wrapper.

Alternative: import Expo Speech throughout the UI or use a cloud provider.
Rejected because scattered calls weaken testability and cloud TTS violates the
offline/no-provider boundary.

### Extend current keyed copy and scroll layout

All speech labels, disclosure, source, summary, TTS status, record-again,
failure, retry, and fallback strings join the existing keyed English/French
map. Buttons keep visible text and matching accessibility labels. Existing
`ScrollView` behavior plus focused component assertions covers reachability;
the separate Android acceptance records the exact enlarged-text device setting.

Alternative: add icon-only controls or a new navigation library. Rejected
because they add accessibility or dependency risk without improving this slice.

## Risks / Trade-offs

- [Nullable columns make source context less normalized] → Validate the fixed
  source object at construction, test round trips, and keep manual rows null.
- [A deterministic sample could look like real listening] → Keep explicit
  visible disclosure in start/processing/review states and assert it in tests.
- [TTS callbacks or queued speech outlive review] → Stop speech on screen exit,
  cancel, record-again, and unmount; prove callbacks do not save or edit data.
- [Expo dependency resolution or audit exposes risk] → Use Expo's resolver,
  record exact version/license/audit, and pause for a material security choice.
- [Automated tests cannot prove Android voice or enlarged-text layout] → Keep
  those checks pending for the separately authorized build and assigned device
  acceptance; do not relabel them as locally passed.

## Migration Plan

1. Add domain proposal/source types and deterministic adapters with focused
   tests.
2. Add the nullable, idempotent SQLite migration and round-trip tests.
3. Resolve `expo-speech`, add the injected TTS wrapper, and implement localized
   start/review/failure/manual-fallback UI with semantics tests.
4. Run repository checks, strict OpenSpec validation, security/dependency/
   attribution/portability/recovery review, and component Verify.
5. Stop before EAS unless central task 3.1 receives exact approval. Return
   current local evidence and the pending device gap when it does not.

Before Archive, rollback reverts this branch, removes `expo-speech` and speech
entry points, and leaves existing manual rows and schema-compatible nullable
columns intact. After Archive, use a new corrective change.
