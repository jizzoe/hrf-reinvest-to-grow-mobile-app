## MODIFIED Requirements

### Requirement: Android prototype identifies its synthetic local context

The application SHALL install as `org.homerootsfoundation.reinvesttogrow` and
SHALL show a synthetic business context with English, French, and Haitian
Creole user-facing resources, explicit HTG currency formatting, and no
participant or production data. User-facing words SHALL be held as reviewable
per-language resource data rather than in application source, and each language
SHALL carry exactly the same key set with English as the canonical set and
fallback. Haitian Creole resources that have not been reviewed by a Haitian
Creole speaker SHALL be recorded as unreviewed in the resource data.

#### Scenario: English synthetic context is shown

- **WHEN** the application opens with English selected
- **THEN** it identifies the synthetic business, uses plain English labels, and
  formats displayed monetary amounts as HTG

#### Scenario: French resources are selected

- **WHEN** French is selected for the application
- **THEN** the manual-entry, confirmation, activity, totals, and status copy is
  displayed from French resources without exposing untranslated technical status
  codes

#### Scenario: Haitian Creole resources are selected

- **WHEN** Haitian Creole is selected for the application
- **THEN** the manual-entry, confirmation, activity, totals, and status copy is
  displayed from Haitian Creole resources, and monetary amounts and dates use
  Haitian conventions rather than defaulting to United States English
  formatting

#### Scenario: A language resource is missing a key

- **WHEN** a language resource does not carry the complete English key set
- **THEN** the repository checks fail rather than silently displaying an
  English value in a non-English interface
