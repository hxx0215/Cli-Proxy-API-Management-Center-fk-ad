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
  Cloud, LMU AI, and the sponsor-mode Kimi integration. Future sponsored brands should be judged by
  behavior rather than only by this list.
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

## Project Structure & Module Organization

This is a React 19 + TypeScript Vite frontend for the CLI Proxy API Management API. Main source lives in `src/`: routes in `src/router`, pages in `src/pages`, components in `src/components`, API clients in `src/services/api`, state in `src/stores`, hooks in `src/hooks`, styles in `src/styles`, and types in `src/types`. Assets live in `src/assets`, with provider icons under `src/assets/icons`. Localization files are in `src/i18n/locales`; update all supported locales when adding user-facing text. Production output is `dist/index.html`.

## Build, Test, and Development Commands

- `bun install --frozen-lockfile`: install dependencies from `bun.lock`.
- `bun run dev`: start the Vite dev server at `http://localhost:5173`.
- `bun run build`: run TypeScript compilation and build `dist/`.
- `bun run preview`: serve the built output locally.
- `bun run test`: run the Bun test suite.
- `bun run lint`: run ESLint over TypeScript/TSX files.
- `bun run verify`: run tests, lint, TypeScript compilation, and the production build.
- `bun run type-check`: run `tsc --noEmit`.
- `bun run format`: apply Prettier to `src/**/*.{ts,tsx,css,scss}`.

## Coding Style & Naming Conventions

Use 2-space indentation, semicolons, single quotes, ES5 trailing commas, and 100-character line width. Prefer typed React components and avoid new `any` unless it marks a boundary. Use the `@/` alias for `src` imports. Component files use PascalCase, hooks use `useName`, API modules use domain names such as `oauth.ts`, and SCSS Modules sit beside their page or component as `Name.module.scss`.

## Testing Guidelines

Tests use Bun's built-in test runner and are colocated under `tests/` as `*.test.ts`. Run `bun run test` for focused test work and `bun run verify` before handoff. Use `bun run type-check` as a fast standalone TypeScript check. For UI changes, verify the affected route in the browser and include screenshots or notes.

## Commit & Pull Request Guidelines

Git history follows Conventional Commit style, for example `feat: add support for xAI provider`, `fix(auth-files): keep disabled card actions visible`, and `ci: use node 24 for releases`. Keep commits focused and scoped when useful. Pull requests should include a change summary, linked issue when applicable, UI screenshots, backend version or reproduction details for integration work, and verification notes.

## Architecture & Configuration Notes

This UI is not the proxy; it talks to the backend Management API under `/v0/management`. Treat backend contracts as the source of truth. For OAuth/provider changes, inspect `../CLIProxyAPI` before changing route names, provider keys, callback parameters, or auth-file semantics. Store no secrets in the repo; management keys are entered at runtime and persisted only in browser storage.
