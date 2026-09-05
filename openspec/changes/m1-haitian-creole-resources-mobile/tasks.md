## 1. Component Plan and Gate

- [x] 1.1 Record explicit component Gate 1 approval of this proposal, the two
  modified specifications, design, tasks, synthetic-only boundary, and the
  decision to ship machine-generated Haitian Creole marked as unreviewed.
- [x] 1.2 Commit and push the approved component plan on its branch and record
  the exact plan revision before application edits.

## 2. Reviewable Resources

- [ ] 2.1 Move the 68 existing keys verbatim into `src/i18n/en.json` and
  `src/i18n/fr.json`, derive `CopyKey` from the English file, and prove by test
  that every existing English and French string is unchanged.
- [ ] 2.2 Add `src/i18n/ht.json` with machine-generated Haitian Creole values
  and a `_meta` entry recording review status, generation method, and date.
- [ ] 2.3 Add a key-parity test asserting each language file carries exactly
  the English key set, with no missing or extra keys.

## 3. Haitian Creole Support

- [ ] 3.1 Extend the language type, device-language resolution, the existing
  language selector, and the text-to-speech language mapping to Haitian Creole.
- [ ] 3.2 Map a Haitian Creole interface to `fr-HT` number and date formatting,
  with a test proving amounts render as Haitian rather than United States
  conventions.

## 4. Review Handoff and Component Close-Out

Note: receipt parser total-keyword resources were moved out of this change
after Gate 1. Those keywords live in `src/receipt/receiptParser.ts`, which
exists only on the receipt slice's branch, so this change cannot reach them
without depending on unmerged work. The receipt slice owns them and will author
its keyword lists in three languages directly. Recorded rather than silently
dropped.

- [ ] 4.1 Produce `docs/translation-review/ht-review-2026-09.md` listing every
  key with its English source and Haitian Creole value, plus the receipt
  keyword lists, in a form a non-developer reviewer can correct.
- [ ] 4.2 Run and record repository checks: formatting, type safety, full Jest
  suite, key parity, unchanged English and French output, Haitian Creole
  formatting, no-network behaviour, dependency audit, and secret patterns.
- [ ] 4.3 Produce component verification mapping every requirement, scenario,
  task, and residual gap, and present it for explicit Gate 2 acceptance before
  Sync or Archive. Record the unreviewed-translation residual gap explicitly.
