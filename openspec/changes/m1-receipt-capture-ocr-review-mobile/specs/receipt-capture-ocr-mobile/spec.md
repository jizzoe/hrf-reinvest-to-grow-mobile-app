## Purpose

Defines Android-local receipt evidence, offline OCR assistance, deterministic
suggestions, and human-confirmed expense behavior for the synthetic M1 mobile
prototype.

## ADDED Requirements

### Requirement: Receipt capture remains synthetic, local, and offline-capable
The application SHALL allow a user to take a synthetic receipt photo or select
a synthetic local receipt image without requiring a backend, cloud OCR,
authentication, provider call, or network connection. It SHALL offer a usable
image-selection or manual-expense fallback when camera permission is denied or
unavailable.

#### Scenario: User selects a receipt while offline
- **WHEN** the device is offline and a user selects a synthetic local receipt
  image
- **THEN** the application starts the local receipt-review flow without an HTTP
  request or a confirmed expense

#### Scenario: Camera permission is unavailable
- **WHEN** camera permission is denied or unavailable
- **THEN** the user can choose a local image or enter the expense manually
  without losing access to the complete expense workflow

### Requirement: Receipt evidence is durable and separate from financial records
The application SHALL persist a captured or selected receipt in app-controlled
local storage and retain safe local metadata separately from an unconfirmed
proposal and from confirmed expense values. Attaching, replacing, cancelling,
or retrying a receipt SHALL NOT by itself create a transaction, alter totals,
or create an outbox operation.

#### Scenario: Receipt is attached before review
- **WHEN** a user captures or selects a receipt image
- **THEN** the app retains a durable local reference and receipt metadata for
  review while transactions, totals, and outbox records remain unchanged

#### Scenario: User replaces or cancels a proposal
- **WHEN** a user replaces an image or leaves receipt review before confirmation
- **THEN** no expense or outbox operation is created from the abandoned proposal

### Requirement: Android OCR uses a bundled local model and preserves extraction evidence
The Android M1 path SHALL process the local receipt image through a replaceable
OCR boundary backed by a bundled Google ML Kit Latin text-recognition model. It
SHALL not use an unbundled Play-services model, first-use download, cloud OCR,
or network request. The application SHALL retain raw OCR text, extraction
outcome, and available line/layout evidence separately from suggested and
confirmed fields.

#### Scenario: Local OCR succeeds on an installed offline build
- **WHEN** a supported synthetic image is processed on the installed Android
  build while offline
- **THEN** the app makes raw extracted text and any available line/layout
  evidence available separately from editable expense fields

#### Scenario: Local OCR fails or has no usable text
- **WHEN** the local recognizer errors, is unavailable, or returns no useful
  text
- **THEN** the app records the extraction outcome, retains an available image,
  and offers retry, image replacement, and manual expense completion

### Requirement: Receipt suggestions are deterministic and non-authoritative
The application SHALL parse available local OCR text/layout evidence with
deterministic rules into an editable receipt proposal. It MAY suggest merchant,
occurrence date, total amount, fixed `HTG` currency, and a short description;
it SHALL not infer category or item-level fields and SHALL leave an unsupported
or uncertain value blank. Each suggestion SHALL expose source and confidence or
uncertainty meaning separately from the final expense fields.

#### Scenario: Parser creates editable suggestions
- **WHEN** OCR returns supported evidence for a synthetic receipt
- **THEN** the review displays its image, raw OCR text, source/uncertainty, and
  editable suggested fields without saving an expense

#### Scenario: Parser cannot determine a supported value
- **WHEN** deterministic rules cannot identify an amount, date, merchant, or
  description with sufficient evidence
- **THEN** that proposal field is blank and the user can provide or correct it
  manually

### Requirement: Explicit expense confirmation remains authoritative
The receipt-review flow SHALL let the user edit or clear every suggested value
before confirmation. Only explicit confirmation through the established local
expense path SHALL create one SQLite-backed expense and one stable queued
outbox identity. The confirmed values, receipt evidence, raw OCR text, and
proposal metadata SHALL remain distinguishable after restart.

#### Scenario: User confirms a corrected receipt expense
- **WHEN** a user corrects a receipt-derived proposal and explicitly confirms
- **THEN** the app saves one normal local expense using the reviewed values,
  preserves receipt/source context separately, updates activity/totals, and
  creates one queued outbox record

#### Scenario: Unconfirmed receipt state is retried
- **WHEN** a user retries OCR or edits a proposal without confirming
- **THEN** no confirmed expense, activity/totals update, or outbox record is
  created

### Requirement: Receipt UX is localized, accessible, and truthful
The M08 capture, processing, review, and failure states SHALL use keyed English
and French resources with English fallback, visible labelled controls, and
stable automation selectors. They SHALL use plain business language, state that
the image is attached and values are suggestions, and never represent OCR,
parser output, or local queue state as a remotely saved record.

#### Scenario: French receipt review is displayed
- **WHEN** the app locale is French and a receipt proposal is shown
- **THEN** capture, status, suggestion, edit, confirm, retry, and manual
  fallback controls use French resource values with visible accessible labels

#### Scenario: Extraction failure is displayed
- **WHEN** OCR or parsing cannot produce a usable proposal
- **THEN** the failure state says the photo is saved and manual entry remains
  available without claiming that a record was saved or remotely sent
