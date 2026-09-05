# Component Gate 1 Approval

Date: 2026-09-05

Change: `m1-haitian-creole-resources-mobile`

Decision: Approved

## Human Decision

Joe Rice explicitly approved this component package after reviewing the
proposal, the two modified specifications, the design, the tasks, and the
stated limitation that Haitian Creole values ship machine-generated and
unreviewed.

## Approved Scope

Component-local only. No central change or cross-repository handoff is
required: the accepted central specifications require localizable plain
business language and name Haitian Creole as the planned primary
entrepreneur-facing language, while only the mobile
`manual-offline-business-journal` and `speech-proposal-mobile` specifications
constrain resources to English and French. Both are modified here.

The approval covers moving user-facing words into per-language JSON resources,
adding Haitian Creole across the language type, locale resolution, existing
language selector and text-to-speech mapping, mapping a Haitian Creole
interface to `fr-HT` number and date formatting, moving receipt total keywords
into reviewable data, adding a key-parity check, producing the reviewer export,
and the component branch lifecycle through Verify.

## Approved Judgement Calls

Carried from the receipt parser review on the same date:

- An ambiguous numeric date such as `03/04/2026` stays blank.
- A shop name containing a digit stays blank.
- A third, Haitian Creole receipt-keyword list is included and flagged for the
  same human review.

## Retained Boundaries

No participant, pilot, or production use. No claim of translation quality. No
settings screen, onboarding language choice, or persisted per-user language
preference. No EAS build, artifact, tester distribution, external account,
credential, backend, cloud, or iOS scope. Replacement of machine-generated
wording with reviewed wording is a separate later change that edits data only.

## Recovery

Resume from Git, this approval, current OpenSpec state, and the first
incomplete evidenced task. Rollback removes Haitian Creole from the language
type and selector and deletes `ht.json`; English and French resources are moved
verbatim and are unaffected.
