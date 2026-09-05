## Context

The M1 prototype holds all user-facing words in a `copy` object literal inside
`src/domain/journal.ts`, keyed per language, read at runtime by
`text(locale, key)`. There are 68 keys. Locale awareness touches five places:
the `AppLocale` type, `resolveLocale`, `formatHtg`, the text-to-speech language
mapping, and the language selector in `App.tsx`.

The accepted `v1-product-guardrails` specification names Haitian Creole as the
planned primary entrepreneur-facing language. The accepted mobile
`manual-offline-business-journal` and `speech-proposal-mobile` specifications
currently constrain resources to English and French, so this change modifies
them.

## Goals / Non-Goals

**Goals:**

- Make translations reviewable data rather than source code, so a Haitian
  reviewer's corrections arrive as a data diff.
- Support Haitian Creole end to end without misrepresenting machine output as
  reviewed wording.
- Establish the structure before the receipt slice authors new keys.

**Non-Goals:**

- Claiming translation quality, or any participant, pilot, or production use.
- A settings screen, per-user language persistence, or onboarding language
  choice; the existing selector is extended, not redesigned.
- Translating evidence documents, code comments, or developer-facing text.
- Changing any behaviour other than which words and formats are displayed.

## Decisions

### Translations become JSON resource files

Each language gets `src/i18n/<locale>.json`. English remains the canonical key
set: the `CopyKey` type is derived from the English file, so a key missing from
English is a type error, and a key missing from another language is caught by
the parity test below.

Alternative considered: keep the TypeScript object and add a third language to
it. Rejected because the stated review workflow hands a file to a
non-developer reviewer and takes corrections back; a source file makes every
correction a code change and mixes wording review with code review.

### Machine-generated Haitian Creole is marked unreviewed in the data

`ht.json` carries a `_meta` entry recording `reviewStatus`,
`generatedBy: machine-translation`, and the date. The reviewer export lists
every key with its English source and Haitian Creole value.

Alternative considered: shipping the values unmarked. Rejected because nothing
would then distinguish reviewed from unreviewed wording once several changes
have accumulated, which is exactly the state the batch review process depends
on being able to tell apart.

### A Haitian Creole interface formats numbers and dates as `fr-HT`

The JavaScript internationalization library has no Haitian Creole data and
silently falls back to United States English, producing `HTG 1,250.50` and
English month names. Haitian conventions are `1 250,50 HTG` and French month
names, which `fr-HT` produces correctly. The interface language and the
formatting locale are therefore separate concerns, mapped explicitly.

Alternative considered: passing `ht` to the formatter. Rejected because it
fails silently and would show a Haitian Creole speaker American formatting.

### Receipt total keywords move into the same reviewable resource

The parser's total and excluded-total keyword lists move into a JSON resource
alongside the interface words, with a Haitian Creole list included and flagged
for review. Receipts printed in Haiti are expected to be predominantly French,
which the existing French list already covers, so the Haitian Creole list is
additive and not relied upon.

Alternative considered: leaving the keywords in parser source. Rejected
because the reviewer is the only person who can say what words actually appear
on a printed receipt in Haiti, and they cannot review code.

### Key parity is enforced by test

A test asserts that every language file has exactly the English key set. This
protects the batch-correction workflow, where a returned file could otherwise
silently drop a key and fall back to English without anyone noticing.

## Risks / Trade-offs

- [Machine translation produces wrong or offensive financial wording] -> ship
  marked unreviewed, restrict to a synthetic prototype with no participants,
  and require a reviewed replacement change before any participant use.
- [A reviewer returns a file with dropped keys] -> the parity test fails the
  build rather than silently falling back.
- [Haitian Creole receipt keywords are guessed] -> the French list carries the
  real workload; the Haitian Creole list is additive and flagged for review.
- [Scope creep into a settings or onboarding language experience] -> the
  existing selector is extended only.

## Migration Plan

1. Extract the existing English and French values verbatim into JSON, proving
   no wording changes by an unchanged-output test.
2. Add Haitian Creole values, the language type, formatting mapping, selector
   entry, and parity test.
3. Produce the reviewer export file.
4. Replacement of machine values with reviewed wording is a later, separately
   approved change that edits data files only.

Rollback removes `ht` from the language type and the selector and deletes
`ht.json`; English and French resources are unaffected because they are moved
verbatim. No persisted data is involved: the interface language is a display
setting, and stored records carry `HTG` and minor units independently of
display text.
