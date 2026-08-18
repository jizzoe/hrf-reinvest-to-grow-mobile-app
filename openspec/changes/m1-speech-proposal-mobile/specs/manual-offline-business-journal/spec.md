## MODIFIED Requirements

### Requirement: Manual Phase-1 flow begins on the approved Business Journal Home

The application SHALL start on a synthetic Home view before entry. It SHALL
present the business context, `This week` local totals, an understandable
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
