## Why

The accepted product guardrails state that Haitian Creole SHALL be planned as
the primary entrepreneur-facing language. The M1 prototype ships English and
French only, and its user-facing words live inside a TypeScript source file
rather than reviewable data, so a Haitian reviewer cannot correct wording
without a developer editing code.

This becomes urgent now rather than later: the pending receipt-capture slice
adds roughly twenty new user-facing keys. Establishing three-language
resources first means those keys are written once in three languages instead
of authored in two and retrofitted afterwards.

## What Changes

- Move the 68 existing user-facing keys out of TypeScript source into one
  reviewable JSON resource file per language: `en`, `fr`, and a new `ht`.
- Add `ht` as a supported interface language across the language type, device
  language resolution, the existing language selector, and text-to-speech
  language mapping.
- Format amounts and dates for a Haitian Creole interface using `fr-HT`
  conventions rather than the platform's silent fallback to United States
  English, which would otherwise render `HTG 1,250.50` instead of
  `1 250,50 HTG`.
- Ship machine-generated Haitian Creole values that are explicitly recorded as
  unreviewed, and produce a reviewer file listing every key with its English
  source and its machine-generated Haitian Creole value.
- Move the receipt parser's total-detection keywords into the same reviewable
  resource, adding a Haitian Creole keyword list flagged for the same review.
- Add a key-parity check so a language file can never silently lose or gain a
  key relative to English.

## Capabilities

### Modified Capabilities

- `manual-offline-business-journal`: user-facing resources become English,
  French, and Haitian Creole rather than English and French.
- `speech-proposal-mobile`: keyed resources and the text-to-speech language
  mapping extend to Haitian Creole.

## Impact

- Component code: language type, resource loading, locale resolution, currency
  and date formatting, language selector, text-to-speech mapping, receipt
  parser keyword source, and their tests.
- No new product feature, screen, or workflow. No change to confirmation,
  persistence, outbox, offline behaviour, or the receipt slice's scope.
- Haitian Creole values ship **unreviewed by a Haitian Creole speaker**. This
  is acceptable only because the prototype is synthetic-only with no
  participant use. A later separately approved change replaces the machine
  values with reviewed wording; that change edits data files only.
- No backend, cloud, provider, credential, EAS build, or participant data is in
  scope.
