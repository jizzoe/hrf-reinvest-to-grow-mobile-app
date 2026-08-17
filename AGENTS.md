# Agent Guidance

## Required Reading

Before OpenSpec lifecycle work, read these sources in order:

1. `AGENTS.md`.
2. `docs/sdd-workflow.md`.
3. `README.md` for the product and repository boundary.
4. The relevant living specifications under `openspec/specs/` and active change
   under `openspec/changes/`, including its central-contract reference.
5. `docs/ai-assistant-governance.md` when an action concerns data, autonomy,
   external mutation, delivery profile, or safety.

Resolve conflicts in favor of the narrower, more recent, explicitly approved
product decision. Pause for a material product, ownership, validation, or safety
conflict.

## Repository Boundary

This public repository owns the Android-first Expo mobile component of Home
Roots Foundation's synthetic Reinvest-to-Grow M1 prototype: mobile source,
SQLite persistence, component tests, Android build configuration, and
component-local evidence. It does not own central planning, backend/API sync,
infrastructure, AWS or other cloud services, iOS/TestFlight, speech, receipt/
OCR, real participant data, or production/pilot delivery.

The current dispatched component is `m1-manual-offline-mobile`, linked to the
central `m1-manual-offline-delivery` contract pin recorded in its change
artifacts. Return component revision, validation evidence, and any divergence to
the central linkage ledger; never claim central or system acceptance locally.

## OpenSpec Lifecycle

Use the generated OpenSpec lifecycle entry point for Explore, Propose, Apply,
Verify, Sync, and Archive. Every lifecycle action also follows
`docs/sdd-workflow.md`.

- Propose is planning only and is not authorization to write app code or create
  external resources.
- Apply requires explicit approval of the component proposal, requirements,
  design, tasks, repository scope, external boundary, and validation plan.
- Verify maps every approved requirement, scenario, task, and constraint to
  component evidence.
- Sync and Archive require verified evidence and explicit approval; central
  linkage and acceptance remain separate gates.

Do not manually edit generated OpenSpec files under `.agents/skills/openspec-*`.
Regenerate them through OpenSpec when the approved workflow changes.

## Approval And Safety Boundaries

Require just-in-time confirmation before external writes, GitHub Issues/Projects/
PRs, EAS project/build changes, authentication, credential work, paid services,
cloud provisioning, destructive actions, real or sensitive data, or scope
expansion. No secret, token, signing key, device identifier, participant record,
or mutable approval grant belongs in this repository.

`prototype-rapid` is the current delivery profile. It uses synthetic data and
does not require an isolated independent reviewer; it does not waive explicit
approval, deterministic validation, physical-device evidence, or central gates.
Globally installed skills are capabilities, not standing authorization. Use them
only when their documented trigger applies.

## Validation And Evidence

Run the contract in `docs/sdd-workflow.md`. Before delivery, report command,
outcome, exact revision, requirement/evidence covered, failures, skipped checks,
and residual gaps. Preserve unrelated user changes and never use destructive
cleanup merely to make the worktree clean.
