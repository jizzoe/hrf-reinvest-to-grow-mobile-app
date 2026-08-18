## 1. Component Plan and Gate

- [x] 1.1 Record explicit component Gate 1 approval of the central pin,
  component proposal/deltas/design/tasks, Android-only mobile scope,
  synthetic/local-only constraints, dependency choices, validation plan,
  recovery plan, and the separately gated EAS/tester boundary.
- [x] 1.2 Run component planning validation and review, commit/push the
  approved component plan on `feat/m1-receipt-capture-ocr-review`, and record
  exact plan revision plus recovery evidence before application edits.

## 2. Native Dependencies and Local Evidence Foundation

- [ ] 2.1 Resolve SDK-compatible `expo-image-picker`, `expo-file-system`, and
  a config-plugin-compatible bundled ML Kit OCR dependency; record locked
  versions, licenses, audit, attribution, generated Android bundled-model
  evidence, no unbundled/cloud/provider dependency, and package-removal
  rollback.
- [ ] 2.2 Add typed receipt evidence, OCR result, deterministic proposal, and
  per-field source/uncertainty models; implement parser fixtures that prove
  supported fields and blank uncertain values without category/item inference.
- [ ] 2.3 Add idempotent SQLite migrations/repository behavior for separate
  receipt file metadata, raw OCR/extraction state, proposal data, and nullable
  confirmed-transaction linkage; add tests for legacy records, restart
  durability, cancel/retry non-writes, and one confirmed expense/outbox pair.
- [ ] 2.4 Implement injected local image and OCR adapters that support
  capture/selection, app-controlled file copy, bundled local text recognition,
  normalized text/layout result, and typed permission/extraction failure without
  any HTTP or cloud path.

## 3. Receipt Review Experience

- [ ] 3.1 Add English/French keyed receipt copy and accessible M08 camera
  preparation, capture, processing, review, and extraction-failure controls
  using approved receipt visual controls and stable test IDs.
- [ ] 3.2 Implement Home receipt entry and local receipt state transitions,
  including camera-denial selection/manual routes, raw-text/proposal separation,
  image replacement/retry, and image-retained extraction failure.
- [ ] 3.3 Reuse the existing editable expense review and explicit confirmation
  path so receipt confirmation alone saves a normal expense, links evidence,
  updates activity/totals, and creates one stable queued outbox row; prove
  cancel/retry/failure never save a transaction.

## 4. Component Verification and Return

- [ ] 4.1 Run and record repository-declared formatting, type, focused/full
  Jest, parser/storage, localized UI/semantic/accessibility, no-network,
  Android public/native bundled-model configuration, OpenSpec, dependency/audit,
  secret-pattern, scope, attribution, portability, and recovery checks. Map
  every task and central/component requirement/scenario to current evidence.
- [ ] 4.2 Run bounded local code/security review for every changed path;
  correct only behavior-preserving objective findings within the correction
  budget and preserve each finding disposition and current rerun evidence.
- [ ] 4.3 Produce component verification evidence mapping every requirement,
  scenario, task, design decision, central pin, skipped check, warning, and
  residual gap. Do not claim an emulator/development session as installed-build,
  bundled-OCR, or central/system acceptance evidence.
- [ ] 4.4 Formally Verify, deliver, Sync, and Archive the exact component
  change through its registered resources; merge verified revisions to `main`,
  perform only eligible cleanup, and return archive/integrated revisions,
  commands, central pin, divergence statement, and residual gaps to the central
  ledger.
- [ ] 4.5 Stop before any EAS build, artifact, or tester operation unless the
  central task 4.1 exact approval confirms project, component revision, build
  profile, distribution boundary, tester scope, and runtime permission; retain
  Android physical-device acceptance as pending otherwise.
