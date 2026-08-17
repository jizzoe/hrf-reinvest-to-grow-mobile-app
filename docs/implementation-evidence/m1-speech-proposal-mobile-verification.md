# M1 Speech Proposal Mobile Apply Verification Evidence

Date: 2026-08-17

Profile: `prototype-rapid`

Central contract pin: `48cb1ad511a3d578c347889e5c78e8a967c16dab`

Component implementation revision: `c7e4abe5a5201b2fe0617c7b51614ee73985581f`

## Assessment

The exact implementation revision is ready to enter formal component OpenSpec
Verify. Local Apply evidence covers all 9 approved requirements, 17 scenarios,
and implementation tasks 1.1 through 4.3. Task 4.5 is satisfied by stopping
before any new EAS operation and retaining device acceptance as pending. Task
4.4 remains intentionally incomplete because Verify, delivery, Sync, Archive,
integration to `main`, and return to the central ledger are later lifecycle
work.

This is Apply-readiness evidence. It does not claim formal OpenSpec Verify,
merge, Archive, central acceptance, physical-device TTS, enlarged-text
acceptance, or installability.

## Requirement And Scenario Evidence

| Requirement                                            | Scenarios | Current evidence                                                                                                                                                                   | Apply disposition                                                                                |
| ------------------------------------------------------ | --------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Truthful deterministic offline sample                  |         2 | `src/speech/speechProposal.ts`, its unit tests, App start-state tests, visible non-recording disclosure, and the bounded provider/permission scan                                  | Covered locally                                                                                  |
| Editable proposal before any write                     |         2 | App tests assert the known 500 HTG rice proposal, transcript/source/summary visibility, editable fields, and zero repository writes before confirmation                            | Covered locally                                                                                  |
| Edit, cancel, and record again preserve user authority |         2 | App tests cover edited confirmation and assert that cancel and record-again do not write                                                                                           | Covered locally                                                                                  |
| Durable transaction and outbox behavior                |         2 | Domain/storage tests cover nullable source metadata, one transaction/one outbox identity, restart persistence, manual compatibility, and original-versus-reviewed values           | Covered locally                                                                                  |
| Optional non-authoritative device TTS                  |         2 | Injected adapter tests cover speak, stop, completion, synchronous error, rejected stop, navigation, locale change, and unmount; App tests prove no TTS callback writes or confirms | Locally covered at the adapter/component boundary; physical Android voice output remains pending |
| Failure, retry, and manual fallback                    |         1 | Adapter and App tests cover unavailable sample, retry, manual-sale fallback, preserved records, and speech-independent manual sale/expense entry                                   | Covered locally                                                                                  |
| Localized, visible, and accessible speech UI           |         2 | Keyed English/French copy and component queries cover visible labels, semantic names, transcript/source/summary, scrollable states, and visible non-audio controls                 | Locally covered; enlarged-text Android inspection remains pending                                |
| Component evidence returned against central pin        |         1 | This report, local check/review evidence, dependency evidence, exact central pin, warning/gap inventory, and retained EAS stop gate                                                | Covered for Apply; integrated/archive revisions remain pending task 4.4                          |
| Manual Business Journal Home remains authoritative     |         3 | Existing and extended App/domain/storage tests cover first-use Home, manual sale/expense independence, local totals/activity after save, and speech/TTS-unavailable fallback       | Covered locally                                                                                  |

## Task And Design Decision Mapping

- Tasks 1.1-1.2: planning review, central Gate 1 pin, controller recovery,
  strict plan validation, and pushed plan revisions are retained in change
  evidence.
- Tasks 2.1-2.3: Expo-compatible `expo-speech@57.0.1`, deterministic local
  proposal adapter, typed source context, and nullable idempotent SQLite
  migration are implemented and tested.
- Tasks 3.1-3.3: injected fail-safe TTS, truthful English/French review states,
  edit/cancel/record-again/manual-fallback behavior, and 23 focused/full tests
  are implemented.
- Tasks 4.1-4.3: deterministic local checks, exact changed-path review with four
  corrected medium findings, and this complete requirement/scenario map are
  retained against the implementation revision.
- Task 4.4: formal Verify, merge, Sync, Archive, cleanup, and central return are
  pending lifecycle work.
- Task 4.5: complete because no EAS operation was run and the gated evidence is
  explicitly retained as pending.

The implementation follows the approved design boundaries: local deterministic
sample rather than capture/provider access; typed proposal and source context;
human confirmation as the only write authority; existing durable journal and
outbox identity; a narrow injected TTS boundary; keyed English/French copy;
nullable backward-compatible storage; and no cloud, microphone, receipt/OCR,
or production-data expansion.

## Deterministic Evidence

- `npm run check`: passed; Prettier, TypeScript, 6 Jest suites, 23 tests, 0
  failures.
- `npm run android:config`: passed; Android application identifier remains
  `org.homerootsfoundation.reinvesttogrow`; no microphone/audio permission or
  provider plugin is present.
- Selected and all strict OpenSpec validation: passed; 2 items, 0 failures.
- Dependency resolution: `expo-speech@57.0.1`, MIT, Expo SDK-compatible.
- Provider, permission, credential-pattern, scope, whitespace, attribution,
  portability, and recovery checks: passed as recorded in the local checks and
  dependency evidence.
- Exact changed-path local review: four medium objective findings corrected;
  final review has no unresolved finding.
- `evidence/implementation-quality.json`: prototype-rapid verification-loop
  result bound to the exact implementation commit and validated with its
  durable authorization context.

## Warnings, Skipped Checks, And Residual Gaps

- Dependency audit warnings remain: 37 affected nodes in the inherited
  Expo/React Native graph (7 moderate, 30 high), 0 critical, no fix available.
  No automatic audit fix or unrelated major upgrade was applied.
- No EAS build or artifact command was run. Central task 3.1 has not supplied
  the separate exact project, source revision, build profile, distribution,
  and runtime approval.
- Device voice output, enlarged-text reachability, and installability of this
  exact revision require permitted Android evidence after that gate.
- Native mobile UI is outside the verification-loop web screenshot/axe matrix;
  browser evidence is not substituted for Android acceptance.
- Formal OpenSpec Verify, component integration, Sync, Archive, eligible
  cleanup, central-ledger return, and system acceptance remain pending task
  4.4 and the central lifecycle.
- The worktree is an isolated registered recovery resource. The original
  component worktree's user-owned `.idea/` remains untouched.

## Divergence And Recovery

No approved-contract divergence is known at Apply readiness. Formal Verify must
re-evaluate all evidence at its exact head and report any later divergence.

Before Archive, recovery is to revert the registered branch's implementation
and evidence commits, remove the speech entry points and `expo-speech`, and
retain the existing Phase 1 manual path plus compatible nullable database
columns. After Archive, recovery requires a new corrective OpenSpec change.
