## Context

See [proposal.md](proposal.md) and the two delta specifications. The existing
Expo 57 application already owns local transactions, source context for the
speech slice, SQLite/outbox atomic persistence, English/French copy, and a
single-screen state flow. The current central dispatch at
`77884c2df34bf0e68e26f015abd42961ac6aee0d` permits this Android-only receipt
slice; it supersedes older Phase-1 receipt exclusions for this exact change.

## Goals / Non-Goals

**Goals:**

- Add durable local receipt evidence and a reviewable, deterministic OCR
  proposal without weakening the established explicit-confirmation path.
- Prove the Android bundled-model path through dependency/configuration and
  offline-device evidence, while keeping OCR replaceable.
- Keep permission, OCR, and parsing failures non-blocking for manual expense
  entry.

**Non-Goals:**

- Cloud OCR, provider accounts, downloading models, live synchronization,
  receipt upload, full scanning/cropping, item/category interpretation, iOS,
  EAS build execution, or real/sensitive data.

## Decisions

### Use Expo image picker and app-controlled file storage

Use SDK-compatible `expo-image-picker` for camera or library acquisition and
`expo-file-system` to copy the selected image into app-controlled storage.
The app retains only local URI, MIME type, size, and non-sensitive metadata;
the component must verify exact locked versions, configuration, licenses, and
runtime permissions. Camera denial continues to selection/manual routes.

Alternative: use a temporary picker URI or require camera access. Rejected
because the receipt must remain reviewable after restart and camera permission
cannot block the core expense flow.

### Use a config-plugin-backed bundled ML Kit adapter

Use `rn-mlkit-ocr` only if its current Expo config plugin can configure the
Latin model with its bundled option enabled; lock the resolved version and
verify generated Android dependencies select `com.google.mlkit:text-recognition`
rather than a `com.google.android.gms:play-services-mlkit-*` artifact. Wrap it
in an injected `ReceiptOcrAdapter` that returns raw text, normalized lines, and
a typed failure result. This selected package and its native configuration need
not operate in Expo Go; acceptance uses a development/preview Android build.

Alternative: use an unbundled model, a cloud API, or mock OCR. Rejected because
each fails the required post-install offline local OCR proof.

### Persist receipt evidence separately and link it only at confirmation

Add a `receipt_files` table keyed by local receipt ID, with app-controlled URI,
MIME type, byte size, OCR status/text/layout JSON, proposal JSON, and nullable
confirmed transaction linkage. Receipt creation/update is durable independently
of a transaction. Confirmation atomically saves the existing transaction and
outbox then links the selected receipt; cancellation/retry never inserts an
expense/outbox operation. Existing speech columns remain compatible.

Alternative: place OCR data directly in transaction columns or save a draft
transaction early. Rejected because it conflates raw evidence, suggestions, and
confirmed financial data.

### Limit parsing to deterministic supported fields

The parser examines line strings and optional coordinates using fixed rules for
amount, ISO-normalized date, merchant-like leading text, and a short
description. It produces optional per-field value/source/confidence data and
never guesses category/items. The review draft uses an expense type, fixed HTG,
and manual category/purpose input; uncertain or absent parser values are blank.

Alternative: LLM extraction or heuristic category detection. Rejected because
non-determinism and false authority are outside M1's privacy and confirmation
boundary.

### Extend the state machine with explicit M08 states

Add camera preparation, capture, processing, review, and extraction-failure
states alongside existing Home/entry/review/speech states. Receipt review uses
the existing field editor and confirmation affordance but visibly presents the
thumbnail, raw OCR text, source/uncertainty, and image-specific fallback.
Stable `testID` selectors cover all flows in both locales.

Alternative: expose a receipt control that routes directly to manual entry.
Rejected because it does not exercise capture/OCR/review behavior.

## Risks / Trade-offs

- [Native library/plugin compatibility changes] → resolve with Expo's current
  dependency tooling, inspect generated Android dependency tree/config, and
  pause if the bundled path cannot be proven without a scope decision.
- [OCR quality is poor] → retain raw text, uncertainty, and full manual
  correction/fallback; never claim quality beyond synthetic proof images.
- [Local images consume storage] → retain a narrow synthetic prototype scope,
  copy only selected images, and defer retention policy/production upload.
- [Receipt data is treated as financial authority] → retain separate tables and
  assertions that only confirmation writes transaction/outbox state.

## Migration Plan

1. Resolve dependencies and native configuration, preserving the no-download
   proof and package-removal rollback.
2. Add typed receipt/OCR/parser data, idempotent SQLite migration, local file
   adapter, and focused persistence/parser tests.
3. Add localized M08 UI states and link explicit confirmation to the existing
   transaction/outbox path.
4. Run component checks and review; obtain a separate EAS/device gate before
   any external build/tester operation.
5. Before Archive, rollback only receipt state, dependencies, and UI while
   retaining existing manual/speech records; use a new corrective change after
   archive.
