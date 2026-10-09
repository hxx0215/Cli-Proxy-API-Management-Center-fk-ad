# Repository Guidelines

## Default Fork Maintenance Workflow

This repository is an ad-free fork of
`router-for-me/Cli-Proxy-API-Management-Center`. Its primary recurring maintenance task is to
merge upstream releases, remove advertising and sponsor integrations, and publish the result from
this fork. Treat this section as the default procedure whenever the user asks to sync, update, or
release from upstream without restating every step.

### Remotes and release branch

- `upstream` is `router-for-me/Cli-Proxy-API-Management-Center` and is read-only for this workflow.
- `origin` is this fork, `hxx0215/Cli-Proxy-API-Management-Center-fk-ad`.
- `main` is the fork's release branch. Never push to `upstream`.
- Preserve merge-based history. Merge `upstream/main` into `main`; do not rebase or rewrite `main`.
- A normal upstream-sync request authorizes fetching upstream, merging, resolving conflicts,
  verifying, committing the merge, pushing `origin/main`, and creating/pushing the matching release
  tag unless the user explicitly requests a local-only operation.

### Sync procedure

1. Confirm the current branch, remotes, and worktree state. Preserve unrelated user changes; never
   discard a dirty worktree to make the merge easier.
2. Fetch the upstream branch with `git fetch upstream --prune --no-tags`. Do not use `--tags`:
   upstream version names are intentionally reused for fork release commits, so fetching all tags
   can try to overwrite this fork's tags.
3. Determine the newest relevant upstream release tag with `git ls-remote --tags upstream`, and
   verify that its commit is contained in the fetched `upstream/main`. Do not invent a version when
   upstream `main` has no corresponding release tag; ask the user in that case.
4. Merge `upstream/main` into `main` with a merge commit. Resolve conflicts by combining upstream's
   non-promotional improvements with this fork's ad-free behavior; do not blindly choose all of
   `ours` or all of `theirs` for provider files.
5. Audit the merged tree for reintroduced ads, sponsor logic, affiliate links, promotional panels,
   sponsor-only assets, tests, routes, and translations. Useful searches include `sponsor`,
   `affiliate`, `apikey.fun`, `Code0`, `FennoAI`, `Qiniu`, and newly introduced sponsored brands.
6. Run `bun run verify`. Do not create a release tag when tests, lint, TypeScript, or the production
   build fails.
7. Commit the merge, push `main` to `origin`, then create a lightweight tag using the upstream
   release version and push that tag to `origin`.
8. Verify that `HEAD`, `origin/main`, and the fork's release tag resolve to the same merge commit and
   that the worktree is clean.

### Ad-free conflict policy

- Preserve the fork's existing removals by reviewing both the fork-only commits and
  `git diff upstream/main...main` before resolving conflicts.
- Remove visible advertising, sponsor registration/dashboard links, affiliate URLs, sponsor quick
  starts, sponsor aggregation layers, sponsor-specific forms, and their unused icons, styles,
  translations, and tests.
- Known sponsor-only provider-workbench integrations include APIKEY.FUN, Code0, FennoAI, Qiniu
  Cloud, LMU AI, Infistar, and the sponsor-mode Kimi integration. Remove BestProxy configuration
  ads and APIMart README banners as well. Future sponsored brands should be judged by behavior
  rather than only by this list.
- Preserve genuine protocol and backend functionality. Existing endpoint configurations should
  remain accessible through the standard Gemini, Codex, Claude, Vertex, xAI, Interactions API, and
  OpenAI-compatible provider groups where applicable.
- Do not remove unrelated features merely because they share a provider name. In particular, keep
  normal Kimi authentication/quota support while removing only its sponsor-oriented provider
  workbench integration. Keep ClaudeAPI support while removing affiliate promotion around it.
- When user-facing sponsor text is removed or normal upstream text is added, keep all supported
  locale files consistent.

### Fork tag policy

- A release tag must point to the verified fork merge commit on `main`, never directly to the
  upstream commit.
- Use the same version string as the synchronized upstream release, for example `v1.21.2`, and use
  lightweight tags to match repository history.
- If fetching or inspecting upstream created the tag locally on the upstream commit, move it with
  `git tag -f <version> HEAD` before pushing it to `origin`.
- Push `origin/main` before pushing the tag. If `origin` already has the same tag pointing somewhere
  else, report the mismatch and obtain confirmation before force-updating the remote tag.

## Project Scope & Structure

This is a React 19 + TypeScript + Vite management frontend for CLI Proxy API, not the proxy itself. It exclusively uses the backend v8 Management API under `/v8/management` and the v8 configuration layout; do not add v0 fallbacks or legacy config adapters. Plugin resources and custom HTTP extensions are exceptions: preserve their backend-declared paths.

- `src/features/`: feature-owned pages, components, hooks, types, and logic. Current features include `dashboard`, `providers`, `authFiles`, `quota`, `config`, and `plugins`. Prefer this layout for new feature work.
- `src/pages/`: existing route pages outside the feature layout. Follow nearby conventions when modifying these; do not migrate unrelated code.
- `src/components/`, `src/hooks/`, `src/utils/`: shared UI, hooks, and utilities. Keep feature-specific code within its feature rather than promoting it prematurely.
- `src/services/api/`: API client, domain endpoints, and backend data normalization. `src/services/storage/`: browser persistence.
- `src/stores/`: Zustand state. `src/types/`: shared types. `src/styles/`: global styles and theme tokens.
- `src/App.tsx`: hash-router setup. `src/router/MainRoutes.tsx`: authenticated route table. `ProtectedRoute` and `MainLayout` guard and wrap the authenticated app.
- `src/assets/`: bundled assets, including provider icons in `icons/`.
- `src/i18n/locales/`: `en.json`, `zh-CN.json`, `zh-TW.json`, `ru.json`, `ko.json`, and `vi.json`; fallback language is `zh-CN`. Update all six files when adding or changing translation keys, including accessible labels.

## Build, Test, and Development Commands

Use Bun; `package.json` pins `bun@1.3.14`, and CI uses Node.js 24. Keep dependency changes consistent with `bun.lock`; do not introduce another package manager's lockfile.

- `bun install --frozen-lockfile`: install locked dependencies.
- `bun run dev`: start Vite at `http://localhost:5173` by default.
- `bun run build`: TypeScript compilation followed by the production Vite build.
- `bun run preview`: serve the built output locally.
- `bun run test`: run all Bun tests.
- `bun test tests/apiError.test.ts`: example focused test run.
- `bun run lint`: run ESLint over TypeScript/TSX files. Some rules emit warnings; the current command does not enforce zero warnings.
- `bun run type-check`: run `tsc --noEmit`; the main TypeScript config includes `src`, not `tests`.
- `bun run verify`: run tests, lint, and build (which includes TypeScript compilation).
- `bun run format`: format all `src/**/*.{ts,tsx,css,scss}`. Prefer targeted formatting of changed files during routine work to avoid unrelated diffs.

## Deployment Constraints

The production artifact is a single `dist/index.html` with JS/CSS and bundled assets inlined by `vite-plugin-singlefile`. The release workflow renames it to `management.html` for backend hosting; `vX.Y.Z` tags trigger releases.

Preserve hash routing and single-file deployment. Changes to assets, imports, code splitting, or build configuration must not introduce required external build artifacts. Do not edit generated `dist/` files. App version is injected as `__APP_VERSION__` from `VERSION`, then git tags, then the package version, falling back to `dev`.

## API Contracts & State

- Treat backend contracts as the source of truth. Inspect `../CLIProxyAPI` before changing endpoint names, payloads, provider keys, OAuth callback parameters, auth-file semantics, or plugin/config contracts. If that checkout is unavailable, report the missing evidence rather than guessing; do not modify the backend unless requested.
- Reuse `apiClient` from `src/services/api/client.ts` for Management API requests through domain modules. It centralizes the API prefix, bearer authentication, error normalization, and response-header handling. Avoid bypassing it with ad hoc requests in components.
- Preserve the client's event integration: `unauthorized` handles 401s, `server-version-update` carries version/build metadata, and `server-plugin-support-update` carries plugin capability information. Keep plugin routes gated by backend support.
- Normalize backend fields on read and serialize on write in the API layer; consult `transformers.ts` and the relevant domain module. Keep raw backend field-name handling out of ordinary UI components.
- `useConfigStore.fetchConfig(forceRefresh?: boolean)` uses a full-config TTL cache and in-flight request deduplication, not section-based fetching. Reuse it where appropriate and invalidate/update caches after mutations using existing store actions.
- Preserve stale-request guards and cache cleanup when switching connections or logging out. Old asynchronous responses must not overwrite the new session's state.
- Provider UI capabilities live in `src/features/providers/descriptors.ts`; `adapters.ts` maps provider configs to the shared resource model. Extend these existing abstractions rather than scattering provider-specific conditionals across components.

## Coding Style & UI Conventions

Use 2-space indentation, semicolons, single quotes, ES5 trailing commas, and 100-character line width. Prefer typed React components and `unknown` with narrowing for untrusted data; avoid introducing `any` unless an unavoidable boundary requires it. Use the `@/` alias for `src` imports.

Component files use PascalCase, hooks use `useName`, and API modules use domain names such as `oauth.ts`. SCSS Modules sit beside their page or component as `Name.module.scss`. Vite automatically injects `src/styles/variables.scss` into SCSS; new modules do not need to import it again. Reuse shared components from `src/components/ui/` and existing theme tokens before adding new primitives or hard-coded colors.

Keep user-facing text in i18n. Preserve keyboard interaction, accessible names, focus behavior, and reduced-motion handling when modifying interactive UI.

## Testing & Verification

Tests are centralized under `tests/` as `*.test.ts` and use `bun:test`. Existing suites cover pure logic, React server-side static rendering via `renderToStaticMarkup`, and source/contract checks. There is no configured browser DOM test harness; static markup tests do not verify browser interactions. Prefer extracting testable logic and following nearby test patterns rather than introducing a new framework by default.

For code changes, add or update relevant regression tests, run focused tests while iterating, and run `bun run verify` before handoff. For UI changes, also verify the affected route in a browser and include screenshots or notes. Report commands actually run, failures, and anything not verified; if a backend or browser is unavailable, state the limitation explicitly. Documentation-only changes can be checked with diff/content validation instead of a full build.

## Security

Never commit real management keys, provider credentials, auth files, or other secrets; redact them from logs, screenshots, and test fixtures. Management keys are entered at runtime and persisted according to the remember-password setting. `src/services/storage/secureStorage.ts` provides reversible obfuscation, not encryption or a security boundary. Do not weaken authentication, plugin trust checks, or session isolation for convenience.

## Commits & Guidance Maintenance

Use Conventional Commits, such as `feat(providers): add a provider` or `fix(auth-files): preserve disabled actions`. Keep changes focused. Pull requests should include a summary, linked issue when applicable, backend version/reproduction details for integration work, UI screenshots or notes when relevant, and verification results.

Maintain shared repository guidance in `AGENTS.md`. When updating it, synchronize the local `CLAUDE.md` to identical content if present; `CLAUDE.md` is currently ignored and untracked, so shared guidance must not depend on it. Keep guidance aligned with source and configuration rather than duplicating long implementation details.
