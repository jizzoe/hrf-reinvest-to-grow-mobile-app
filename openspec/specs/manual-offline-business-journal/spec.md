# Manual Offline Business Journal Specification

## Purpose

Defines the Android-local Business Journal behavior needed to prove a synthetic
entrepreneur can reliably record and review confirmed sales and expenses offline.

## Requirements

### Requirement: Android prototype identifies its synthetic local context

The application SHALL install as `org.homerootsfoundation.reinvesttogrow` and
SHALL show a synthetic business context with English and French user-facing
resources, explicit HTG currency formatting, and no participant or production
data.

#### Scenario: English synthetic context is shown

- **WHEN** the application opens with English selected
- **THEN** it identifies the synthetic business, uses plain English labels, and
  formats displayed monetary amounts as HTG

#### Scenario: French resources are selected

- **WHEN** French is selected for the application
- **THEN** the manual-entry, confirmation, activity, totals, and status copy is
  displayed from French resources without exposing untranslated technical status
  codes

### Requirement: Manual Phase-1 flow begins on the approved Business Journal Home

The application SHALL start on a synthetic Home view before entry. It
SHALL present the business context, `This week` local totals, an understandable
saved-local status, a recent-activity or empty state, and clearly labeled
`Record sale` and `Record expense` actions. It SHALL use the selected M1 visual
reference's calm near-white, deep-navy, green, and coral hierarchy without
claiming live synchronization. A Phase 2 `Use speech` action MAY appear only as
the optional, truthfully disclosed deterministic proposal path defined by
`speech-proposal-mobile`; manual sale and expense actions SHALL remain complete
and usable without speech or TTS. Receipt actions SHALL NOT appear as
functional or dead-end controls in this component change.

#### Scenario: First use starts on Home

- **WHEN** the application opens without confirmed records
- **THEN** the user sees the synthetic Business Journal Home, zero HTG local
  totals, usable Record sale and Record expense actions, the optional truthful
  speech sample action, and a plain-language empty activity state rather than a
  pre-opened entry form

#### Scenario: Saving returns to updated Home

- **WHEN** a user confirms a valid synthetic sale or expense through manual or
  reviewed speech-proposal entry
- **THEN** the application returns to Home, shows the updated signed activity
  item and local totals, and labels the saved record as local without claiming
  a remote send

#### Scenario: Speech assistance is unavailable

- **WHEN** speech sample or device TTS assistance is unavailable
- **THEN** the user can still start and complete manual sale and expense entry
  from Home without network, microphone permission, or audio output

### Requirement: Users confirm manual sales and expenses while offline

The application SHALL let a user enter a sale or expense with type, amount,
date, category or purpose, and optional note, then review and explicitly
confirm it while no network connection is available. It SHALL create no
confirmed record before confirmation.

#### Scenario: Sale is confirmed offline

- **WHEN** a user completes and confirms a valid synthetic sale while the
  device is offline
- **THEN** the application saves one confirmed local record and shows it
  immediately in recent activity

#### Scenario: Expense is cancelled before confirmation

- **WHEN** a user cancels from the review state for a synthetic expense
- **THEN** no confirmed Business Journal record or outbox item is created from
  that draft

#### Scenario: Required field is missing

- **WHEN** a user attempts to review a draft without a valid required value
- **THEN** the application explains the missing value in plain language and
  does not permit confirmation

### Requirement: Confirmed records survive restart in local SQLite storage

The application SHALL persist each confirmed sale or expense in SQLite-backed
local storage and SHALL preserve its recorded type, amount, date, category or
purpose, optional note, currency, confirmation state, and local status after
normal application restart.

#### Scenario: Confirmed record survives restart

- **WHEN** a confirmed local sale or expense is saved and the application is
  closed and reopened
- **THEN** the same record appears in recent activity with its preserved
  displayed values and status

#### Scenario: Confirmation is repeated

- **WHEN** a user repeats a confirmation action after the original confirmation
  succeeds
- **THEN** the application does not create a duplicate confirmed record for
  that action

### Requirement: Local activity and totals reflect confirmed records only

The application SHALL show recent confirmed local activity and local-period
money earned, money spent, and estimated profit. It SHALL label the summary as
local prototype information rather than an audited, complete, synchronized, or
loan-eligibility financial statement.

#### Scenario: Local sale updates activity and totals

- **WHEN** a synthetic sale is confirmed
- **THEN** recent activity includes the sale and local money earned and
  estimated profit update

#### Scenario: Local expense updates activity and totals

- **WHEN** a synthetic expense is confirmed
- **THEN** recent activity includes the expense and local money spent and
  estimated profit update

### Requirement: Confirmed records have stable local outbox identities

The application SHALL create one durable local outbox record for each confirmed
transaction with a stable local transaction identifier, client idempotency key,
create-operation identity, queued local state, and understandable user-facing
local status. It SHALL not send a transaction to a backend in this change.

#### Scenario: Confirmation creates local outbox state

- **WHEN** a user confirms a sale or expense
- **THEN** its durable local transaction and outbox records have stable
  identities and the user sees a plain-language local status such as Saved on
  this phone or Waiting to sync

#### Scenario: Restart preserves pending local identity

- **WHEN** the application restarts before a future sync service exists
- **THEN** the confirmed transaction and its outbox/idempotency identity remain
  stable without an attempted network request

### Requirement: Android build and deterministic evidence are produced safely

The component SHALL provide deterministic local validation evidence and a
versioned EAS internal-distribution Android APK that can be installed and opened
on the representative Android 15 device without a developer workstation
connection. Build, screenshots, logs, and fixtures SHALL use synthetic data and
SHALL exclude credentials, signing material, account tokens, and device
identifiers.

#### Scenario: Signed Android build is available

- **WHEN** the Phase-1 component build is complete
- **THEN** an EAS-managed, versioned Android APK and safe install instructions
  are available only through the authorized prototype distribution path

#### Scenario: Only a developer session exists

- **WHEN** the evidence contains only an emulator or development-server session
- **THEN** the physical-device Android-installability requirement remains
  incomplete
