# Mobile Component SDD Workflow

## Purpose

This is the local SDD policy for the Reinvest-to-Grow Android mobile component.
It supplements OpenSpec-generated Codex lifecycle skills with repository-owned
product boundary, approvals, validation, GitHub integration, and recovery.
Read [`AGENTS.md`](../AGENTS.md) first.

## Bootstrap Decisions

- Component repository: `jizzoe/hrf-reinvest-to-grow-mobile-app`, temporary
  public ownership pending transfer to HRF before participant, pilot, or
  production use.
- Product scope: Android-only, synthetic-data Phase-1 manual Business Journal
  prototype; English/French resources, HTG presentation, SQLite persistence,
  local activity/totals, and sync-shaped local outbox identity.
- Non-goals: live backend sync, AWS/other cloud, iOS/TestFlight, speech/TTS,
  receipt/image/OCR, participant or production data, and paid-plan upgrades.
- Assistant and lifecycle: Codex; Explore, Propose, Apply, Verify, Sync, and
  Archive.
- Delivery profile: `prototype-rapid`, with `strict-first-degraded` controller
  posture; no isolated independent reviewer is required.
- GitHub lifecycle: Issues, Project #2, PRs, Sync, and Archive are in scope
  through `config/sdd-github.json`. Each external write still requires explicit
  current authorization.

## Ownership

| Path | Owner and purpose |
| --- | --- |
| `.agents/skills/openspec-*` | OpenSpec-generated Codex lifecycle integrations; regenerate, never hand-edit. |
| `openspec/config.yaml` | Project-owned OpenSpec context, artifact rules, and operation guidance. |
| `openspec/specs/` | Accepted component-local living behavior. |
| `openspec/changes/` | Proposed and active component changes. |
| `AGENTS.md`, `docs/` | Project-owned governance, workflow, and evidence. |
| `config/ai-skills.json` | Non-secret reusable-skill defaults. |
| `config/sdd-github.json` | Non-secret GitHub owner/repository/Project lifecycle mapping. |

## Lifecycle

Explore clarifies uncertainty without changing accepted behavior. Propose creates
one reviewable component outcome and is planning only. Apply starts only after
explicit approval of all component artifacts, scope, external boundaries, and
validation plan. Verify maps every requirement, scenario, task, and quality
constraint to evidence. Sync promotes only verified behavior. Archive requires
component Verify, explicit component Gate-2 approval, durable central return
evidence, and then the distinct central close-out gate.

The component must preserve its central contract pin, report contract divergence
instead of silently changing scope, and return its component change identifier,
archive revision, exact component revision, validation/build evidence, and
divergence statement to the central linkage ledger.

## Approvals, Data, And External Services

Use synthetic data only. Require confirmation before GitHub Issues/Project/PR
changes, EAS project/build/signing actions, authentication, any cloud/provider
action, paid service, deployment, destructive operation, sensitive data, or
scope expansion. EAS-managed Android signing and one free-plan internal-
distribution APK are approved only when an approved component Apply task reaches
that action. Do not expose EAS credentials, signing material, or artifact access
beyond authorized prototype testers.

## Validation Contract

For bootstrap and OpenSpec-only changes, run:

```bash
openspec --version
openspec context --json
openspec config get workflows
openspec list --json
openspec validate --all --strict --no-interactive
git diff --check
git status --short
```

For app changes, the approved change must also name and pass its exact locked-
dependency install, format, lint, type-check, unit/component, persistence,
Android build/configuration, security/privacy, and physical-device acceptance
commands. Evidence must distinguish passed, failed, skipped, and pending checks;
an emulator or development-server session cannot prove installed-APK behavior.

## Reusable Skills And GitHub Integration

Use generated `openspec-*` actions for lifecycle work. When their triggers
apply, global skills include `github-issue-authoring`,
`github-issue-to-openspec`, `openspec-github-sync`,
`project-pr-status-sync`, `base-verification-loop`, `base-code-review`, and
`independent-review` for production-rapid only. They are invoked deliberately,
not continuously running automation. Read `config/sdd-github.json` before a
GitHub lifecycle action; run a read-only audit or dry run before repair, and seek
current authorization before every external mutation.

The current global GitHub skills are discoverable but their canonical helper
scripts and any GitHub Actions workflow are not installed in this component
repository. Therefore Issue/Project/PR automation is configured as a policy but
is not yet executable as background automation. A separate approved integration
change must provide a reviewed adapter or repository-local workflow before any
automatic reconciliation is claimed.

## Recovery

Keep valid generated files on partial initialization and rerun OpenSpec rather
than editing them. Preserve unrelated work in a dirty tree. Correct a validation
failure with up to three behavior-preserving attempts, then pause with evidence.
If EAS, a device, a required skill, or a GitHub integration is unavailable, keep
the affected requirement pending and report the exact gap rather than claiming
completion.
