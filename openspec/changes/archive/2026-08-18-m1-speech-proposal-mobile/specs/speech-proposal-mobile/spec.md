## Purpose

Defines the Android component behavior that turns a truthfully disclosed local transcript fixture into an editable, human-confirmed Business Journal sale without live capture or provider access.

## ADDED Requirements

### Requirement: Speech assistance is a truthful deterministic offline sample

The application SHALL expose a deterministic speech-shaped sample without
recording audio, requesting microphone permission, contacting a provider, or
requiring network access. Its start and processing states SHALL visibly state
that the prototype uses a sample message and is not recording or transcribing
the user.

#### Scenario: Sample starts offline
- **WHEN** the user activates `Use speech` with no network connection
- **THEN** the application presents the deterministic sample and can continue to review without an external request

#### Scenario: Sample boundary is visible
- **WHEN** the sample is starting or being processed
- **THEN** visible text says it is a prototype sample and does not claim that the microphone is listening or the user's speech was captured

### Requirement: Transcript produces an editable proposal before any write

The known transcript `I sold rice for 500 gourdes today` SHALL produce an
editable sale proposal for 500 HTG with a rice purpose, raw transcript,
`Suggested from speech` source label, and visible confirmation summary. The
application SHALL not change confirmed records, totals, or the outbox until the
user explicitly confirms the reviewed proposal.

#### Scenario: Known transcript produces a proposal
- **WHEN** the deterministic sample completes successfully
- **THEN** the user sees its transcript, speech source, editable sale fields, and a plain-language 500 HTG summary

#### Scenario: Proposal remains unconfirmed
- **WHEN** the proposal is displayed or edited without confirmation
- **THEN** transactions, recent activity, totals, and outbox records remain unchanged

### Requirement: Edit, cancel, and record again preserve user authority

The review state SHALL allow editing, cancellation, replacement through
`Record again`, and explicit confirmation. Cancel and record-again SHALL
discard the unconfirmed candidate without creating a transaction or outbox
record.

#### Scenario: Edited proposal is confirmed
- **WHEN** the user changes a proposed value and confirms
- **THEN** the saved sale uses the reviewed value while preserving the original transcript and proposal metadata separately

#### Scenario: Proposal is cancelled or recorded again
- **WHEN** the user cancels or activates `Record again` before confirmation
- **THEN** no record is saved and record-again returns to the sample start state

### Requirement: Confirmation reuses durable transaction and outbox behavior

Explicit confirmation SHALL create one normal SQLite-backed sale with stable
transaction, idempotency, operation, and queued outbox identities. It SHALL
persist `speech_transcript` source context, raw transcript, fixture identity,
and original proposed values separately from confirmed values, and all data
SHALL survive restart without duplication.

#### Scenario: Speech proposal is confirmed offline
- **WHEN** the user confirms the reviewed proposal while offline
- **THEN** one sale and one queued outbox identity are created and local activity and totals update

#### Scenario: Confirmed speech sale survives restart
- **WHEN** the application restarts after confirmation
- **THEN** the transaction and source context remain available without a duplicate transaction or outbox operation

### Requirement: Device TTS is optional and cannot mutate state

The review state SHALL offer an accessibly named action that attempts to read
the same visible summary through device text-to-speech. Completion, error,
interruption, or stopping on screen exit SHALL NOT confirm, edit, cancel, or
block the proposal or manual workflow.

#### Scenario: User requests read aloud
- **WHEN** the user activates the read-aloud action
- **THEN** the device attempts to speak the visible localized summary without saving the proposal

#### Scenario: TTS is unavailable or errors
- **WHEN** no suitable voice is available or speaking fails
- **THEN** the visible proposal remains editable and all non-audio actions remain usable

### Requirement: Failure retains retry and complete manual fallback

The deterministic adapter SHALL expose an unavailable result with plain
language retry and `Enter sale yourself` actions. Failure SHALL preserve
existing records and SHALL NOT make manual sale or expense entry depend on
speech, TTS, microphone permission, or network access.

#### Scenario: Sample is unavailable
- **WHEN** the deterministic adapter returns no usable sample
- **THEN** the user can retry or open the existing manual sale flow without data loss

### Requirement: Speech UI is localized, visible, and accessible

All new controls and status copy SHALL use keyed English and French resources
with English fallback, synthetic HTG examples, visible labels, and matching
accessible names. Transcript, source, summary, editable fields, and primary
review/fallback actions SHALL remain readable and reachable on the
representative small Android screen at the documented enlarged-text setting,
without relying on icon-only controls or TTS.

#### Scenario: French speech resources are active
- **WHEN** French is the active interface locale
- **THEN** speech controls and status copy use French resources while the synthetic transcript remains visibly identified and currency remains HTG

#### Scenario: Semantics and enlarged text are inspected
- **WHEN** start, review, failure, and fallback states are inspected at the documented enlarged-text setting
- **THEN** every action has an accessible name matching its visible purpose and required content and actions remain reachable without audio

### Requirement: Component evidence returns against the central pin

Component verification SHALL map every requirement and scenario to current
deterministic checks and permitted Android evidence, cite central revision
`48cb1ad511a3d578c347889e5c78e8a967c16dab`, and report the exact integrated
revision, archive, dependency decision, divergence, skipped checks, and
residual gaps. A new EAS operation SHALL remain pending without separate exact
approval.

#### Scenario: Component delivery is evaluated
- **WHEN** the local lifecycle reaches verification
- **THEN** the evidence package identifies the central pin and refuses completion for uncovered behavior or unapproved EAS evidence
