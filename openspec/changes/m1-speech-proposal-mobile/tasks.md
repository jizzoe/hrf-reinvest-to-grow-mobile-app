## 1. Component Plan And Pin

- [x] 1.1 Record a current component planning review and the central Gate 1 authorization, covering pin `48cb1ad511a3d578c347889e5c78e8a967c16dab`, proposal/spec/design/tasks, repository scope, `prototype-rapid` profile, synthetic/no-provider boundary, dependency decision, validation, recovery, and the separate EAS gate.
  - Evidence: `evidence/planning-review.md` and schema-valid `evidence/local-planning-review.json` cover the complete component plan, the newer approved central pin, the slice-level Gate 1 authorization, and the retained EAS boundary with no unresolved planning finding.
- [x] 1.2 Run the component OpenSpec planning validation contract, commit and push the approved plan on `feat/m1-speech-proposal-confirmation`, and record exact plan revision and controller recovery evidence before application edits.
  - Evidence: pushed plan revision `269f13e79e39b49377017e6ba75fce20cce7320b`; selected and all strict OpenSpec validation passed with 2 items and 0 failures, review-result schema validation and `git diff --check` passed, and controller run `764fe2e9-72e2-4674-8081-96c6b56a3e0c` retains registered worktree/branch recovery records.

## 2. Proposal, Source, And Persistence

- [ ] 2.1 Resolve `expo-speech` through Expo's SDK-compatible installer and record the exact locked version, license, audit result, attribution, absence of microphone/provider packages or permissions, and package-removal rollback.
- [ ] 2.2 Add typed speech proposal/source context and a deterministic local transcript adapter for the known success fixture and unavailable result; add focused tests for truthful fixture data, original-versus-reviewed values, and no external input path.
- [ ] 2.3 Extend confirmed transaction construction and SQLite with an idempotent nullable source-metadata migration; add domain and storage tests proving manual compatibility, speech context round trip, restart stability, and unchanged one-transaction/one-outbox identity.

## 3. Accessible Speech Review Experience

- [ ] 3.1 Add a narrow injected device-TTS adapter with speak/stop/error/completion behavior and tests proving callbacks, errors, interruption, cancel, record-again, screen exit, and unmount cannot confirm or alter financial state.
- [ ] 3.2 Implement Home speech entry plus truthful sample start, suggestion review, edit, cancel, record-again, unavailable/retry, and manual-sale fallback states using visible and accessibly named English/French keyed copy and a visible non-audio path.
- [ ] 3.3 Add component tests covering proposal-before-save, known 500 HTG mapping, edited confirmation, cancel and record-again non-writes, failure/manual fallback, activity/totals, source visibility, locale copy, semantic labels, scroll reachability, and no microphone/network/provider behavior.

## 4. Verification, Delivery, And Return

- [ ] 4.1 Run and record format, TypeScript, focused and complete Jest, Android public configuration, strict selected/all OpenSpec, dependency/audit, bounded secret-pattern, changed-scope, attribution, portability, and recovery checks with exact outcomes and requirement/task mapping.
- [ ] 4.2 Run bounded local code and security review over every changed path, correct only behavior-preserving objective findings within budget, rerun affected evidence, and retain all finding dispositions.
- [ ] 4.3 Produce component verification evidence that maps every requirement, scenario, task, design decision, central pin, skipped check, warning, and residual gap; do not treat local tests as device TTS, enlarged-text, installability, or central acceptance evidence.
- [ ] 4.4 Formally Verify, deliver, Sync, and Archive the exact component change through registered resources, merge the verified revisions to `main`, perform only eligible cleanup, and return the archive revision, integrated revision, commands, central pin, no-divergence or divergence statement, and residual gaps to the central ledger.
- [ ] 4.5 Stop before any new EAS build or artifact operation unless central task 3.1 records exact current approval for project, source revision, build profile, distribution boundary, and runtime permission; retain Android device TTS, enlarged-text, and installability acceptance as pending otherwise.
