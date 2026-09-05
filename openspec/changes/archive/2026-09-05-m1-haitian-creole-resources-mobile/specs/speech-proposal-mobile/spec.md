## MODIFIED Requirements

### Requirement: Speech UI is localized, visible, and accessible

All new controls and status copy SHALL use keyed English, French, and Haitian
Creole resources with English fallback, synthetic HTG examples, visible labels,
and matching accessible names. Transcript, source, summary, editable fields,
and primary review/fallback actions SHALL remain readable and reachable on the
representative small Android screen at the documented enlarged-text setting,
without relying on icon-only controls or TTS. The text-to-speech language
mapping SHALL resolve an explicit language for every supported interface
locale, and SHALL preserve the accepted behaviour that unavailable speech never
blocks on-screen review or confirmation.

#### Scenario: French speech resources are active

- **WHEN** French is the active interface locale
- **THEN** speech controls and status copy use French resources while the
  synthetic transcript remains visibly identified and currency remains HTG

#### Scenario: Haitian Creole speech resources are active

- **WHEN** Haitian Creole is the active interface locale
- **THEN** speech controls and status copy use Haitian Creole resources, the
  text-to-speech adapter receives an explicit mapped language rather than an
  unmapped locale, and unavailable speech still leaves review and confirmation
  usable on screen

#### Scenario: Semantics and enlarged text are inspected

- **WHEN** start, review, failure, and fallback states are inspected at the
  documented enlarged-text setting
- **THEN** every action has an accessible name matching its visible purpose and
  required content and actions remain reachable without audio
