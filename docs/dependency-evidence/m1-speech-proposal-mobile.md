# M1 Speech Proposal Mobile Dependency Evidence

Date: 2026-08-17

## Decision

- Command: `npx expo install expo-speech` after restoring the locked dependency
  set with `npm ci` in the isolated worktree.
- Resolved direct dependency: `expo-speech@57.0.1` for Expo SDK 57.
- License: MIT.
- Upstream package source: Expo monorepo, `packages/expo-speech`.
- Purpose: device-local text-to-speech behind a narrow injected adapter.
- No speech-to-text, microphone, recorder, network/provider, backend, or cloud
  package was added.

## Audit And Supply Chain

`npm ci` before adding `expo-speech` and the post-install audit both reported
19 vulnerabilities in the existing Expo/React Native dependency graph (7
moderate, 12 high in npm's summary). The JSON report represents 37 affected
dependency nodes, with no critical finding and no available automatic fix.
`expo-speech` has no package-specific advisory in the report; npm labels it high
only through the existing direct `expo` dependency. No `npm audit fix` or
breaking dependency update was applied.

The install reported the existing optional `fsevents@2.3.3` install-script
notice. No new script approval, global package, user configuration, microphone
permission, credential, or provider configuration was introduced.

## Attribution And Recovery

The package name, version, MIT license, and upstream repository are retained in
this record. Before component Archive, rollback removes `expo-speech` through
the package manager, restores the lockfile, and removes only the local TTS
adapter and speech entry points. Existing manual behavior and stored records
remain intact.
