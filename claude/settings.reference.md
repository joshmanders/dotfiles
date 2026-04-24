# Claude Code `settings.json` Reference

Exhaustive reference for every documented key in Claude Code's `settings.json`, verified against the shipping binary schema (v2.1.119) and official docs.

## Scope precedence

Highest wins:

```
Managed (MDM/policy) > CLI flags > Local (.claude/settings.local.json)
  > Project (.claude/settings.json) > User (~/.claude/settings.json)
```

## Conventions

- Types use zod notation (what the binary actually enforces).
- `optional()` means the key may be omitted — omission typically means "use the built-in default."
- Enterprise-only = has no effect outside managed/policy settings.
- Managed-only = will be silently ignored in user/project/local scopes.

---

## Environment & Auth

### `env`

- **Type:** `Record<string, string>`
- **Default:** `{}`
- **Purpose:** Environment variables injected into every Claude Code session. Available to all tools, hooks, bash commands, and subagents.
- **Expansion:** Supports `${VAR}` / `$VAR` syntax — resolved at runtime against the parent shell env.
- **Scope merging:** Merges across settings levels; higher-precedence scopes override same-name keys.
- **Gotcha:** Not for secrets — use a credential helper or `.env` files for sensitive values.
- **Useful env vars worth knowing:**
  - `DISABLE_AUTOUPDATER=1` — fully disables the auto-updater (the real way; `autoUpdatesChannel` has no "off" value)
  - `DISABLE_TELEMETRY=1`, `DISABLE_ERROR_REPORTING=1`, `DISABLE_BUG_COMMAND=1`, `DISABLE_FEEDBACK_COMMAND=1`, `DISABLE_COST_WARNINGS=1`
  - `CLAUDE_CODE_USE_BEDROCK=1`, `CLAUDE_CODE_USE_VERTEX=1` — third-party providers
  - `CLAUDE_CODE_DISABLE_THINKING=1` — disable extended thinking
  - `CLAUDE_CODE_DISABLE_FAST_MODE=1` — block fast mode

### `apiKeyHelper`

- **Type:** `string` (path to executable)
- **Default:** unset
- **Purpose:** Path to a script that prints the API key on stdout. Called when Claude Code needs a key, every 5 minutes, or after a 401.
- **Gotcha:** Terminal CLI only — Claude Desktop/web use OAuth. Script must emit **only** the key to stdout. If it takes >10s the prompt bar warns.
- **TTL override:** `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` env var.
- **Credential precedence:** cloud provider env > `ANTHROPIC_AUTH_TOKEN` > `ANTHROPIC_API_KEY` > `apiKeyHelper` > `CLAUDE_CODE_OAUTH_TOKEN` > subscription OAuth.

### `awsCredentialExport`

- **Type:** `string` (path to script)
- **Default:** unset
- **Purpose:** Path to a script that emits AWS credentials as `export VAR=value` lines. Used with Bedrock.

### `awsAuthRefresh`

- **Type:** `string` (path to script)
- **Default:** unset
- **Purpose:** Path to a script that refreshes expired AWS credentials (Bedrock). Runs on 401 or token expiry.

### `gcpAuthRefresh`

- **Type:** `string` (shell command, **not** path)
- **Default:** unset
- **Purpose:** Shell command Claude Code runs to refresh expired GCP credentials (Vertex AI). Example: `"gcloud auth application-default login"`.

### `otelHeadersHelper`

- **Type:** `string` (path to script)
- **Default:** unset
- **Purpose:** Path to a script that outputs OpenTelemetry headers (for enterprise observability).

---

## Model & Reasoning

### `model`

- **Type:** `string`
- **Default:** tier-dependent (Max/Team Premium → Opus 4.7; Pro/Team/API → Sonnet 4.6; Bedrock/Vertex → Sonnet 4.5 at time of writing)
- **Valid:** aliases (`default`, `best`, `sonnet`, `opus`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan`) or full IDs (`claude-opus-4-7`, etc.)
- **Purpose:** Initial model for the session. Not enforcement — user can still switch via `/model` picker.
- **Gotcha:** Aliases track latest; pin full IDs for version stability. `[1m]` suffix enables 1M context.

### `availableModels`

- **Type:** `string[]`
- **Default:** unset (no restrictions)
- **Purpose:** Allowlist for the `/model` picker, `--model` flag, `ANTHROPIC_MODEL` env, Config tool. Accepts family aliases (`"opus"` matches any opus version).
- **Gotcha:** "Default" option is **always** available regardless of this list. Merges and dedupes across scopes. To strictly enforce, set in managed settings.

### `modelOverrides`

- **Type:** `Record<string, string>`
- **Default:** unset
- **Purpose:** Maps Anthropic model IDs to provider-specific IDs (Bedrock ARNs, Vertex deployment names, Foundry). Enterprise third-party routing.
- **Gotcha:** Keys must be **exact** Anthropic IDs including any dated suffix (`claude-opus-4-7`, not `opus`). Only applies to third-party providers. `availableModels` filtering runs against Anthropic ID, not override value.

### `effortLevel`

- **Type:** `"low" | "medium" | "high" | "xhigh"` (persisted)
- **Default:** model-dependent (Opus 4.7 → `xhigh`; Opus 4.6 / Sonnet 4.6 → `high`)
- **Purpose:** Persisted reasoning/thinking depth.
- **Gotcha:** `"max"` exists at runtime but is **not** persistable here — only available via `/effort` or `CLAUDE_CODE_EFFORT_LEVEL` env var. `"xhigh"` became persistable as of v2.1.119.
- **Precedence:** `CLAUDE_CODE_EFFORT_LEVEL` env > this setting > model default.

### `alwaysThinkingEnabled`

- **Type:** `boolean`
- **Default:** `true` (when absent, thinking is on for supported models)
- **Purpose:** Master switch for extended thinking. `false` disables it entirely.
- **Alt disable:** `CLAUDE_CODE_DISABLE_THINKING=1`.

### `fastMode`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Persists `/fast` across sessions. Reduces latency via tool parallelism.
- **Gotcha:** Mutually exclusive with `fastModePerSessionOptIn: true`.

### `fastModePerSessionOptIn`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** If true, fast mode must be opted into each session (doesn't persist).

### `outputStyle`

- **Type:** `string`
- **Default:** `"Default"`
- **Valid:** `"Default"`, `"Explanatory"`, `"Learning"`, or a custom style name from `~/.claude/output-styles/` or `.claude/output-styles/`.
- **Purpose:** Modifies the system prompt at session start — tone/role/format without changing capability.
- **Gotcha:** Takes effect on next session. Custom styles are Markdown + YAML frontmatter; can include `keep-coding-instructions: true` to retain engineering guidance.

### `advisorModel`

- **Type:** `string`
- **Default:** unset
- **Purpose:** Advisor model for server-side advisor tool. Rare; enterprise/internal use.

### `autoCompactWindow`

- **Type:** `number` (int, 100_000–1_000_000)
- **Default:** unset
- **Purpose:** Auto-compact window size (tokens).

### `autoCompactThreshold`

- **Type:** `number`
- **Default:** unset
- **Purpose:** Threshold controlling when auto-compact triggers.

### `showThinkingSummaries`

- **Type:** `boolean`
- **Default:** unset (uses built-in)
- **Purpose:** Show thinking summaries in the UI.

### `promptSuggestionEnabled`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Controls whether prompt suggestions appear. `false` disables them.

### `showClearContextOnPlanAccept`

- **Type:** `boolean`
- **Default:** unset
- **Purpose:** Show a "clear context" prompt when a plan is accepted.

---

## UI & Display

### `language`

- **Type:** `string`
- **Default:** unset (English)
- **Valid:** language name (`"japanese"`, `"spanish"`) or BCP-47 code.
- **Purpose:** Preferred response language **and** voice dictation language.
- **Gotcha:** Dictation supports 20 languages; unsupported values fall back to English for voice only (text responses unaffected).

### `voiceEnabled`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Enables push-to-talk voice dictation.
- **Requires:** Claude.ai account (not API keys/Bedrock/Vertex). v2.1.69+. Does not work in remote/SSH/WSL-without-WSLg.
- **Keybind:** default hold key is `Space`, rebindable via `~/.claude/keybindings.json`.

### `spinnerTipsEnabled`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Show tips in the spinner while Claude is working.

### `spinnerTipsOverride`

- **Type:** `{ tips: string[], excludeDefault?: boolean }`
- **Default:** unset
- **Purpose:** Custom tips. `excludeDefault: true` replaces built-ins; otherwise additive.

### `spinnerVerbs`

- **Type:** `{ mode: "append" | "replace", verbs: string[] }`
- **Default:** unset (uses built-ins)
- **Purpose:** Customize the action verb in the spinner.
- **Cosmetic only.**

### `syntaxHighlightingDisabled`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Disable syntax highlighting in diffs.

### `terminalTitleFromRename`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Whether `/rename` updates the terminal tab title.

### `prefersReducedMotion`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Reduces/disables animations (spinners, shimmer, flash) for accessibility.

### `defaultView`

- **Type:** `"chat" | "transcript"`
- **Default:** unset
- **Purpose:** Default transcript view — `"chat"` shows SendUserMessage checkpoints only; `"transcript"` shows the full stream.

### `editorMode`

- **Type:** `"normal" | "vim"`
- **Default:** `"normal"`
- **Purpose:** Key binding mode for the prompt input. `"vim"` enables vim-style navigation and editing (hjkl, visual mode, etc.) in the input box.
- **Gotcha:** Invalid values silently fall back to `undefined` (`.catch(void 0)` in schema). Only affects the input prompt, not file editing.

### `verbose`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Show full tool output instead of truncated summaries. When enabled, tool results are displayed in full rather than collapsed.

### `preferredNotifChannel`

- **Type:** `"auto" | "iterm2" | "iterm2_with_bell" | "terminal_bell" | "kitty" | "ghostty" | "notifications_disabled"`
- **Default:** `"auto"` (detects terminal)
- **Purpose:** Preferred OS notification channel for task-complete and attention-needed alerts.
- **Gotcha:** In tmux, progress bars and notifications require `set -g allow-passthrough on`.

### `terminalProgressBarEnabled`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Emit OSC 9;4 progress sequences during long operations. Supported terminals: Ghostty 1.2.0+, iTerm2 3.6.6+, ConEmu.

### `awaySummaryEnabled`

- **Type:** `boolean`
- **Default:** `true` (when absent or `true`, recap is enabled)
- **Purpose:** Controls the session recap shown when you return after 5+ minutes of inactivity. `false` disables automatic recaps; `/recap` still works manually.
- **Gotcha:** Marked `@internal` in schema — hidden from public SDK types.

---

## Permissions & Security

### `permissions`

- **Type:** `object`
- **Structure:**
  - `allow: string[]` — auto-approved tool invocations.
  - `ask: string[]` — force a confirmation prompt.
  - `deny: string[]` — absolute block (takes precedence over everything).
  - `defaultMode: "default" | "acceptEdits" | "bypassPermissions" | "plan" | "dontAsk" | "auto"` — session-start permission mode.
  - `additionalDirectories: string[]` — extra paths Claude can read/write.
  - `disableBypassPermissionsMode: "disable"` (managed-only) — disable bypass mode org-wide.
  - `disableAutoMode: "disable"` (managed-only) — disable auto mode org-wide.
- **Rule syntax:** `Tool`, `Tool(*)`, `Tool(pattern)`, `Bash(cmd *)`, `Read(/path/**)`, `WebFetch(domain:example.com)`, `mcp__server__tool`, `Agent(AgentName)`.
- **Evaluation:** deny > ask > allow. First match wins within a category.
- **Process wrappers stripped** for Bash matching: `timeout`, `time`, `nice`, `nohup`, `stdbuf`, `xargs`. Env runners (`docker exec`, `npx`, `devbox run`) are **not** stripped.
- **Path patterns:** `//abs/path` (FS root), `~/path` (home), `/path` (project-root), `path` / `./path` (cwd-relative).

### `skipDangerousModePermissionPrompt`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Suppresses the warning dialog when entering `bypassPermissions` mode. The mode itself is still active.
- **Gotcha:** Dangerous in shared environments. Use managed `permissions.disableBypassPermissionsMode: "disable"` if you need to kill the mode entirely.

### `skipAutoPermissionPrompt`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Suppresses the auto-mode consent dialog.

### `skipWebFetchPreflight`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Skips WebFetch blocklist check. For enterprise environments with strict network policies that break the preflight.

---

## Hooks & Automation

### `hooks`

- **Type:** `Record<EventName, { matcher?: string, hooks: HookHandler[] }[]>`
- **Default:** `{}`
- **Events:** `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`, `Notification`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `Stop`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`.
- **Handler types:** `command` (exec + stdin/stdout JSON), `http` (POST), `prompt` (single-turn LLM), `agent` (subagent).
- **Matcher:** empty/omitted = all; plain = exact; `A|B` = alternatives; regex chars = regex match.
- **Common handler fields:** `timeout` (seconds, default 600), `if` (permission-rule filter, v2.1.85+), `async`, `asyncRewake`, `statusMessage`, `once`.
- **Hook env vars:** `$CLAUDE_PROJECT_DIR`, `$CLAUDE_PLUGIN_ROOT`, `$CLAUDE_PLUGIN_DATA`, `$CLAUDE_ENV_FILE`, `$CLAUDE_CODE_REMOTE`.
- **Exit codes (command hooks):** 0 = allow (may emit JSON on stdout), 2 = block (stderr shown), other = non-blocking error.
- **Gotcha:** Deny rules from settings always beat hook `"allow"` decisions. `PermissionRequest` doesn't fire in headless mode (`-p`) — use `PreToolUse`.

### `disableAllHooks`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Kill-switch that disables every hook (and statusLine) without removing them.

### `disableSkillShellExecution`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Disable inline shell execution in skills and custom slash commands.

### `allowedHttpHookUrls`

- **Type:** `string[]`
- **Default:** unset (no URL allowlist)
- **Purpose:** Allowlist for HTTP hook targets. Supports `*` wildcard (`https://hooks.example.com/*`).

---

## MCP Servers

### `mcpServers`

- **Type:** `Record<string, { command: string, args?: string[], env?: Record<string,string>, disabled?: boolean, alwaysAllow?: boolean }>`
- **Default:** `{}`
- **Purpose:** Inline MCP server definitions. Server name becomes the permission prefix: `mcp__<name>__<tool>`.
- **Gotcha:** `command` must be an executable (absolute path or in `PATH`). `args` is an array — no string splitting. No shell features (pipes, `cd`); wrap in a shell script if needed.

### `enableAllProjectMcpServers`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Auto-approve all MCP servers from project `.mcp.json` without per-server prompts.

### `enabledMcpjsonServers`

- **Type:** `string[]`
- **Default:** unset
- **Purpose:** Allowlist of server names from `.mcp.json` to enable. Filter when multiple available.

### `disabledMcpjsonServers`

- **Type:** `string[]`
- **Default:** `[]`
- **Purpose:** Blocklist for `.mcp.json` servers. Takes precedence over `enabledMcpjsonServers`.

### `allowManagedMcpServersOnly` *(managed-only)*

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Only managed `allowedMcpServers` are loaded; user/project `mcpServers` are ignored. `deniedMcpServers` still merges from all scopes.

### `allowedMcpServers` *(managed-only)*

- **Type:** same shape as `mcpServers`
- **Purpose:** Managed-only allowlist used when `allowManagedMcpServersOnly: true`.

### `deniedMcpServers`

- **Type:** `string[]`
- **Default:** `[]`
- **Purpose:** Absolute MCP server blocklist. Merges across scopes.

---

## Git & Attribution

### `attribution`

- **Type:** `{ commit?: string, pr?: string }`
- **Default:** built-in co-author trailer applied.
- **`attribution.commit`:** text appended to commit messages. Empty string `""` hides attribution entirely.
- **`attribution.pr`:** text appended to PR body. Empty string `""` produces PRs with no body.

### `includeGitInstructions`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Whether built-in git workflow guidance is injected into the system prompt. Set `false` if you have custom git rules in CLAUDE.md and the built-in advice conflicts.

### `includeCoAuthoredBy` *(DEPRECATED)*

- **Type:** `boolean`
- **Default:** `true`
- **Status:** Deprecated — use `attribution.commit` with `""` to hide, or any custom trailer.

---

## Memory

### `autoMemoryEnabled`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Enable auto-memory (per-project learnings across sessions).
- **Requires:** v2.1.59+. Machine-local, per git repo. Alt disable: `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

### `autoMemoryDirectory`

- **Type:** `string` (path, supports `~/`)
- **Default:** auto-derived from git repo name under `~/.claude/projects/<project>/memory/`
- **Scope restriction:** **Rejected** in project settings (`.claude/settings.json`) to prevent committed settings from redirecting memory to sensitive paths. User/local/managed only.

### `autoDreamEnabled`

- **Type:** `boolean`
- **Default:** server-side default (overridable here)
- **Purpose:** Background memory consolidation ("auto-dream"). Set to override server default.

---

## Sessions & Files

### `cleanupPeriodDays`

- **Type:** `number` (int, positive)
- **Default:** `30`
- **Purpose:** Delete inactive session transcripts older than N days at startup.
- **CRITICAL BUG (as of 2.1.92):** setting to `0` silently disables transcript persistence (not cleanup) — `/resume` shows "No conversations found." To retain forever, use a huge value (`36500`).

### `plansDirectory`

- **Type:** `string` (relative to project root; `~/` supported)
- **Default:** `~/.claude/plans`
- **Purpose:** Where `/plan` stores plan files. Project-scope rejects absolute/external paths.

### `additionalDirectories` *(top-level, top-level alias of `permissions.additionalDirectories`)*

- **Type:** `string[]`
- **Default:** `[]`
- **Purpose:** Extra directories Claude can read/write. Supports absolute, `~/`, and relative paths.
- **Scope restriction:** Not allowed in project settings — memory/CLAUDE.md writes could get redirected to sensitive paths. User/local/managed only.

### `respectGitignore`

- **Type:** `boolean`
- **Default:** `true`
- **Purpose:** Whether the `@` file picker respects `.gitignore`. `.ignore` files are always respected regardless.

### `defaultShell`

- **Type:** `"bash" | "powershell"`
- **Default:** `"bash"` (all platforms — no Windows auto-flip)
- **Purpose:** Shell for input-box `!` commands. PowerShell requires `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`.

### `worktree`

- **Type:** `{ symlinkDirectories?: string[], sparsePaths?: string[] }`
- **Default:** `{}`
- **`symlinkDirectories`:** dirs symlinked from main repo into each worktree (e.g. `node_modules`). Saves disk + time.
- **`sparsePaths`:** git sparse-checkout cone-mode paths. One-way operation — hard to un-sparse.
- **Gotcha (issue #28041):** worktrees don't auto-inherit `.claude/` subdirs. Use `WorktreeCreate`/`WorktreeRemove` hooks to propagate skills/agents/rules.

### `feedbackSurveyRate`

- **Type:** `number` (0–1)
- **Default:** provider-dependent
- **Purpose:** Probability the session-quality survey appears when eligible. `0` suppresses, `0.05` = 5% of sessions.

### `remoteControlAtStartup`

- **Type:** `boolean`
- **Default:** `false`
- **Purpose:** Start Remote Control bridge automatically each session. Registers the local session with claude.ai/code and the Claude mobile app for remote access.
- **Manual alternative:** `claude --remote-control`, `claude remote-control`, or `/remote-control` (alias `/rc`) within a session.
- **Gotcha:** Requires full-scope authentication (not API keys or limited tokens). On Team/Enterprise, an admin must enable Remote Control in admin settings. Known VS Code extension bug (issue #41036): the extension ignores this setting — use `/remote-control` manually.

---

## Updates

### `autoUpdatesChannel`

- **Type:** `"latest" | "stable" | "rc"`
- **Default:** `"latest"`
- **Purpose:** Release channel. `"stable"` lags `latest` by ~1 week. `"rc"` tracks release candidates.
- **Real disable:** set `DISABLE_AUTOUPDATER=1` in `env`. Invalid values here are silently dropped; there is no JSON-level "off."

### `minimumVersion`

- **Type:** `string` (semver)
- **Default:** unset
- **Purpose:** Prevents downgrades below this version when switching channels. Does **not** force upgrades.

---

## Enterprise / Managed-Only

These have **no effect** in user/project/local settings — they're only read from managed (policy/MDM) settings.

### `allowManagedHooksOnly`

- Only managed + SDK + force-enabled plugin hooks run. User/project hooks are ignored.

### `allowManagedPermissionRulesOnly`

- Only managed `permissions` rules apply. User/project/CLI rules ignored.

### `allowManagedDomainsOnly`

- Only managed `allowedDomains` and `WebFetch(domain:...)` rules apply.

### `allowManagedReadPathsOnly`

- Only managed `allowRead` paths apply.

### `allowManagedMcpServersOnly`

- See MCP section above.

### `forceLoginMethod`

- **Type:** `"claudeai" | "console"`
- Forces login type. `claudeai` = Pro/Max; `console` = API billing.

### `forceLoginOrgUUID`

- **Type:** `string | string[]`
- Required org UUID(s) for login. Single UUID pre-selects during login flow. Empty array = fail-closed (useful for lockout).

### `forceRemoteSettingsRefresh`

- **Type:** `boolean`
- Blocks startup until remote managed settings are freshly fetched; exits if fetch fails.

### `pluginTrustMessage`

- **Type:** `string`
- Custom message appended to plugin trust warning. Managed-only.

### `channelsEnabled`

- **Type:** `boolean`
- Teams/Enterprise opt-in for channel notifications. Default `false`.

---

## Sandbox (macOS)

Lives under `sandbox: { ... }`:

- `enabled: boolean` — sandbox on/off.
- `failIfUnavailable: boolean` — exit if sandbox can't start.
- `allowAllUnixSockets: boolean` — unblock all unix sockets.
- `allowLocalBinding: boolean` — allow binding local ports.
- `allowUnixSockets: string[]` — macOS-only unix socket allowlist.
- `allowWrite: string[]` — additional write paths.
- `allowRead: string[]` — re-allow paths within `denyRead` regions.
- `enableWeakerNetworkIsolation: boolean` — macOS only; allows `com.apple.trustd.agent` (for `gh`, `gcloud`, Go CLIs).
- `enableWeakerNestedSandbox: boolean`.
- `autoAllowBashIfSandboxed: boolean`.
- `allowUnsandboxedCommands: boolean` — allow `dangerouslyDisableSandbox` param.
- `httpProxyPort: number`, `socksProxyPort: number`.

---

## Undocumented / Non-existent

Keys sometimes suggested in blog posts but **not** in the schema:

- `coAuthoredBy`, `coAuthorName`, `coAuthorEmail` — never existed. Use `attribution.commit`.
- `strictPluginOnlyCustomization` — not in schema.

---

## Settings **not** hardcoded in this repo's `settings.json`

The following documented keys are intentionally left unset in our `settings.json` because setting them to their "default" would either change behavior or restrict defaults that are better inherited dynamically:

- `model`, `availableModels`, `modelOverrides` — tier/account-dependent; hardcoding restricts.
- `apiKeyHelper`, `awsCredentialExport`, `awsAuthRefresh`, `gcpAuthRefresh`, `otelHeadersHelper` — unset = no helper; empty string could break.
- `language`, `spinnerVerbs`, `spinnerTipsOverride` — unset uses built-ins.
- `autoMemoryDirectory` — auto-derived from git repo; setting breaks auto-derivation.
- `minimumVersion` — opt-in floor.
- `worktree` — empty object = default behavior; only set if using worktrees heavily.
- `advisorModel`, `autoCompactWindow`, `autoCompactThreshold`, `showThinkingSummaries`, `showClearContextOnPlanAccept`, `defaultView`, `skipAutoPermissionPrompt`, `skipWebFetchPreflight`, `allowedHttpHookUrls`, `disableSkillShellExecution`, `feedbackSurveyRate`, `channelsEnabled`, `autoDreamEnabled` — opt-in features; defaults are implicit.
- `enabledMcpjsonServers` — unset = load all; `[]` would mean "allow none."
- All managed-only keys — no effect in user scope.

---

## Sources

- Shipping binary schema: `/opt/homebrew/Caskroom/claude-code@latest/2.1.119/claude` (zod definitions)
- Official docs: https://code.claude.com/docs/en/settings
- Hooks: https://code.claude.com/docs/en/hooks
- Permissions: https://code.claude.com/docs/en/permissions
- MCP: https://code.claude.com/docs/en/mcp
- Auth: https://code.claude.com/docs/en/authentication
- Env vars: https://code.claude.com/docs/en/env-vars
- Model config: https://code.claude.com/docs/en/model-config
- Memory: https://code.claude.com/docs/en/memory
- Output styles: https://code.claude.com/docs/en/output-styles
