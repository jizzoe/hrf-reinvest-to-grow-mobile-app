# M1 Haitian Creole Resources — Component Verification

Date: 2026-09-05
Change: `m1-haitian-creole-resources-mobile`
Branch: `feat/m1-haitian-creole-resources`
Revision: `d537131`

## Assessment

| Dimension    | Result                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Completeness | Tasks 1.1-4.2 complete. 4.3 is this report.                                                                                    |
| Correctness  | Both modified requirements and all six scenarios have test evidence.                                                           |
| Coherence    | Follows the approved decisions: JSON resources, English canonical, unreviewed marking, `fr-HT` formatting, parity enforcement. |

## Requirement and Scenario Evidence

| Scenario                                   | Evidence                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English synthetic context is shown         | `resources.test.ts` verbatim-wording cases; existing `App.test.tsx` English flow unchanged.                                                                                  |
| French resources are selected              | `resources.test.ts` French verbatim cases; existing `App.test.tsx` French speech-control test still passes.                                                                  |
| Haitian Creole resources are selected      | `App.test.tsx` renders the `HT` selector and asserts Kreyòl control names and `Semèn sa a`; `resources.test.ts` asserts Haitian rather than United States amount formatting. |
| A language resource is missing a key       | `resources.test.ts` asserts each language carries exactly the English key set and no empty values.                                                                           |
| Haitian Creole speech resources are active | `SPEECH_LANGUAGE` maps every locale explicitly; existing unavailable-speech tests still pass, preserving on-screen review.                                                   |
| Semantics and enlarged text are inspected  | Unchanged by this change; existing accessibility assertions in `App.test.tsx` pass.                                                                                          |

## Checks Run

Command: `npm run check` at revision `d537131`. Exit status 0.

- Formatting: passed, with the reviewer document added to the checked set.
- Type safety: `tsc --noEmit` passed.
- Tests: 7 suites, 50 tests, all passing.
- Dependency audit: 16 vulnerabilities (11 moderate, 5 high), unchanged from
  before this change and all rooted in Expo build tooling (`@xmldom/xmldom`,
  `image-size`, `uuid`). No dependency was added or changed by this work.
- Secrets: no credential, key, token, participant, or device identifier appears
  in any changed file. Changed files are two app source files, three JSON
  resource files, two test files, one reviewer document, and `package.json`.
- Network: no code path was added that performs I/O. Resource files are static
  imports resolved at build time.

## Evidence That Existing Wording Was Not Altered

English and French values were extracted mechanically from the previous
`copy` object rather than retyped. Six representative strings, quoted from the
pre-extraction source including accented French, are asserted verbatim in
`resources.test.ts`. The key count is asserted at 68, matching the original.

## Defect Found and Fixed

The language selector rendered its label as `candidate === 'en' ? 'EN' : 'FR'`,
so adding a third language produced two buttons both labelled `FR`. This was
caught by an existing French test becoming ambiguous rather than by new work.
Corrected to render the language code directly.

## Residual Gaps

- **Every Haitian Creole value is machine-generated and unreviewed.** This is
  recorded in `src/i18n/ht.json` under `_meta`, asserted by test, and is the
  reason `docs/translation-review/ht-review-2026-09.md` exists. Participant,
  pilot, or production use requires reviewed wording first.
- Haitian Creole text-to-speech maps to `fr-HT`. No Haitian Creole device voice
  is assumed to exist; the existing unavailable-speech path covers absence, but
  no device evidence of Haitian Creole speech output is claimed.
- Haitian Creole number and date formatting uses Haitian French conventions,
  which is a deliberate substitution, not platform Haitian Creole support.
- Receipt total-keyword resources were moved out of this change after Gate 1
  because they live on the receipt slice's branch. The receipt slice owns them.
- No installed-build or physical-device evidence is claimed. Verification is
  repository-level only.

## Statement

This is verification evidence for component Gate 2 review. It is not approval
to Sync or Archive, and it makes no claim about translation quality.
