# M1 Speech Proposal Mobile Local Checks

Date: 2026-08-17

Checked at: `2026-08-17T22:37:45Z`

Profile: `prototype-rapid`

Central pin: `48cb1ad511a3d578c347889e5c78e8a967c16dab`

## Deterministic Checks

| Command or review                                                                                                 | Outcome                                         | Coverage                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                                                                                   | Passed                                          | Prettier, TypeScript, and complete Jest suite: 6 suites, 23 tests, 0 failures                                                                                                      |
| Focused type/Jest reruns during batches                                                                           | Passed after bounded test-harness corrections   | Proposal/source, migration/manual compatibility, restart/outbox, TTS adapter/error/non-write, edit/confirm, cancel/record-again, failure/manual fallback, English/French semantics |
| `npm run android:config`                                                                                          | Passed                                          | Expo SDK 57 public config, Android package `org.homerootsfoundation.reinvesttogrow`, version code 2; no microphone/audio permission or speech provider plugin                      |
| `openspec context --json`                                                                                         | Passed                                          | Nearest root is the isolated registered component worktree                                                                                                                         |
| `openspec config get workflows`                                                                                   | Passed                                          | Exact workflow list: explore, propose, apply, verify, sync, archive                                                                                                                |
| `openspec validate m1-speech-proposal-mobile --strict --no-interactive`                                           | Passed                                          | Selected component proposal, two deltas, design, and tasks                                                                                                                         |
| `openspec validate --all --strict --no-interactive`                                                               | Passed: 2 items, 0 failures                     | Active component change and accepted manual living spec                                                                                                                            |
| `npm ls expo-speech --depth=0`                                                                                    | Passed                                          | Exact direct dependency `expo-speech@57.0.1`                                                                                                                                       |
| `npm audit --audit-level=critical`                                                                                | Exit 0 at critical threshold; warnings retained | No critical advisory; 37 affected nodes reported (7 moderate, 30 high), inherited through the existing Expo/React Native graph, with no fix available                              |
| Bounded provider/permission scan over `App.tsx`, `src`, `app.json`, and `package.json`                            | No matches                                      | No `fetch`, XHR, Axios, audio/recorder package, microphone permission, or runtime permission request                                                                               |
| Bounded credential-pattern scan over changed code, tests, planning, evidence, package, lock, and app config paths | No matches                                      | No private key, AWS key, GitHub token, or Slack token pattern                                                                                                                      |
| `git diff --check`                                                                                                | Passed                                          | Patch whitespace and conflict-marker integrity                                                                                                                                     |
| `git status --short --branch` and scope review                                                                    | Passed with expected change-owned paths only    | User-owned original-worktree `.idea/` is outside this worktree and untouched; no EAS, build artifact, backend, cloud, receipt/OCR, or unrelated source change                      |

## Dependency, Attribution, And Security Disposition

`docs/dependency-evidence/m1-speech-proposal-mobile.md` records Expo's
SDK-compatible resolver result, MIT license, upstream source, unchanged
pre/post-install audit summary, inherited no-fix advisories, install-script
notice, and rollback. No automatic audit fix, dependency major upgrade,
credential, provider, microphone permission, or user/global configuration
change was applied.

The audit findings remain an explicit prototype warning. They are not newly
introduced package-specific vulnerabilities in `expo-speech`, and no critical
finding exists at the selected threshold. Production or participant use still
requires a separately approved dependency-hardening decision.

## Requirements And Scenario Mapping

- Truthful deterministic sample, visible disclosure, known transcript, and no
  provider: `src/speech/speechProposal.ts`, App start-state tests, and bounded
  provider/permission scan.
- Proposal-before-save, edit/confirm, cancel, record-again, and manual fallback:
  App component tests with repository-write assertions.
- Source separation, manual compatibility, restart persistence, and stable
  outbox identity: typed domain model, nullable SQLite migration, mapping tests,
  and memory-repository restart tests.
- Device TTS assistance and non-authority: injected adapter boundary, wrapper
  unit tests, visible summary/error state, navigation stop behavior, and zero
  writes until confirmation.
- English/French labels and accessibility semantics: keyed resources and
  role/name component queries across start, review, failure, and fallback.
- Home-first manual behavior: existing manual flow test plus optional speech
  entry; manual sale and expense remain independent of speech and TTS.

## Portability And Recovery

Product constants remain in this component's product-scoped code and evidence,
not reusable skills. External behavior is behind typed adapters; SQLite
migration is idempotent and nullable; existing manual rows remain readable.
Before Archive, revert the registered branch, remove `expo-speech` and speech
entry points, and retain the Phase 1 manual path and compatible nullable
columns. After Archive, use a new corrective change.

## Skipped And Pending Evidence

- No EAS build or artifact operation was run because central task 3.1 has no
  separate exact approval.
- No physical-device claim is made for device voice output, enlarged-text
  reachability, or installability of this exact speech revision.
- Native mobile is outside the verification loop's web screenshot/axe matrix;
  no browser evidence is substituted for Android acceptance.
- Component tests and Android public configuration do not establish central or
  end-to-end acceptance. Those gates remain pending in the central ledger.
