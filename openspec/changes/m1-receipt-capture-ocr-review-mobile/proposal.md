## Why

M1's delivered manual and synthetic speech paths prove local transaction entry,
but the approved central receipt slice has not yet tested whether a receipt can
be retained and used safely as local, reviewable evidence. This component change
implements that bounded Android proof without allowing OCR or parsing to become
an authoritative financial write.

It implements the mobile portion of central change
`prototype-receipt-capture-ocr-review`, pinned at central revision
`77884c2df34bf0e68e26f015abd42961ac6aee0d`.

## What Changes

- Add local synthetic receipt image capture/selection, durable app-controlled
  file metadata, and camera-permission-safe image/manual fallbacks.
- Add a replaceable Android OCR adapter using a bundled, offline ML Kit Text
  Recognition model; retain raw result and extraction state separately from
  proposed and confirmed expense values.
- Add deterministic, confidence-labelled receipt suggestions for supported
  merchant, date, amount, HTG currency, and description fields; unsupported or
  uncertain values remain blank and editable.
- Add localized M08 receipt capture, processing, review, and failure states,
  then reuse the existing manual expense confirmation, SQLite, totals, local
  status, idempotency, and outbox path.
- Add focused validation, native dependency/configuration, privacy, attribution,
  recovery, and component-return evidence.

## Capabilities

### New Capabilities

- `receipt-capture-ocr-mobile`: Android-local capture, OCR-assisted receipt
  proposal, review/confirmation, fallback, persistence, and evidence behavior.

### Modified Capabilities

- `manual-offline-business-journal`: Permit a functional receipt-assisted
  expense entry point while retaining the complete manual offline flow and its
  established confirmation/durability behavior.

## Impact

- **Application:** Home, receipt workflow state, domain draft/source types,
  local file/OCR/parser adapters, SQLite persistence/migration, localized copy,
  and component tests.
- **Dependency and Android configuration:** add only SDK-compatible image
  capture/storage and bundled local OCR dependencies required for this mobile
  proof; exact versions, licenses, audit result, and native configuration must
  be reviewed before delivery.
- **External boundary:** no cloud OCR, backend request, EAS build/artifact,
  credential, deployment, real data, iOS/TestFlight, or external write is
  included. Any EAS/tester action retains the separate central task-4.1 gate.
- **Return:** component archive/integrated revisions, validation evidence,
  central pin, divergence statement, and residual gaps return to the central
  receipt linkage ledger.
