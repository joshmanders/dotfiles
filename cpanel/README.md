# cpanel — Claude Panel

A TUI for everything in `~/.claude/`. Browse, search, and clean — and mine your conversation logs for patterns that turn into rules, skills, and bin scripts.

```bash
cpanel
```

(`~/.files/bin/cpanel` is a thin wrapper that `exec`s `bun run` against this project.)

---

## Config

`~/.config/cpanel/config.json` is symlinked from `~/.files/cpanel/config.json` so it lives in the dotfiles repo. `cpanel/install.sh` sets the symlink up on a fresh machine; until then the file is auto-created at the symlink target on first run.

```json
{
  "ignoreProjects": []
}
```

| Key              | Type       | Effect                                                                                                                            |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ignoreProjects` | `string[]` | Path prefixes to hide from project-attributable UI lists. Aggregates (totals, sparklines, weekly deltas) still include them. Supports `~/`. |

Example: `{ "ignoreProjects": ["~/Code/patientprism"] }`.

Behavior is split between **lists** (filtered) and **aggregates** (unfiltered):

| Where it appears                                                  | Behavior                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Conversations / Sessions / Live / Projects sidebar lists          | Hidden                                                                  |
| Dashboard "Top projects" + "Active sessions" + recent finding cards | Hidden                                                                  |
| Insights findings (Corrections / Patterns / Stuck Loops / Wasted Work) | Hidden — miners only see non-ignored conversations                      |
| Cost → Projects + Sessions sub-tabs                                | Hidden                                                                  |
| Cost → Days totals + footer total + this-week / last-week deltas  | **Included** — these are aggregates                                     |
| Dashboard "Today" / "All time" / 30-day sparklines                | **Included**                                                            |
| Digest day list + daily totals + tool usage + sparklines          | **Included**                                                            |
| Digest "Projects worked on" + "Most-edited files"                 | Shown as `[REDACTED]` so the row count still adds up                    |
| Search (ripgrep over jsonls)                                      | Hidden — `--glob` excludes the project dirs entirely                    |

After changing `ignoreProjects`, restart cpanel. The conversation cache at `~/.claude/.cpanel-cache/conversations.json` always holds the full data (including ignored) so aggregates remain accurate.

**Temporary override:** press `.` from any panel to toggle showing ignored projects. Status bar reflects the current mode (`. show ignored` ↔ `. hide ignored`). Hidden by default. Useful when you want to search across everything (including client work) without editing the config — flip it on, search, flip back.

Caveats:

- Plain-text mentions of the project name inside *other* conversations are not scrubbed.
- Settings, Plans, and Cleanup panels are not project-attributable and are unaffected.

---

## Stack

- [Bun](https://bun.sh) (already installed via Brewfile)
- [@opentui/react](https://opentui.com) — React reconciler for terminal UIs (the same TUI stack `opencode` uses in production)

---

## Global controls

| Key                | Action                          |
| ------------------ | ------------------------------- |
| `tab` / `S-tab`    | Next / previous panel           |
| `1`–`9` / `0`      | Jump to panel N (10 = `0`)      |
| `.`                | Toggle showing ignored projects (config `ignoreProjects`) |
| `space` / `PgDn`   | Scroll preview down             |
| `PgUp`             | Scroll preview up               |
| `Ctrl-D` / `Ctrl-U`| Half-page scroll down / up      |
| `Home` / `End`     | Top / bottom of preview         |
| `q` / `Ctrl-C`     | Quit (terminal restored cleanly) |

Mouse:

- Click any tab in the header to switch panels
- Click any list row to select it
- Wheel scroll inside a list moves the selection
- Wheel scroll inside a preview scrolls the content
- Drag the `│` between sidebar and preview to resize (width persists across panels)

Each panel adds its own bindings shown in the status bar.

---

## Panels

### Dashboard

Landing view that surfaces everything at a glance. Cards:

- **Today** — sessions, messages, tool calls
- **Active sessions** — live `●` Claude Code processes (`kill(pid, 0)` check)
- **All time** — totals from `stats-cache.json`
- **Last 30 days** — message + session sparklines with totals
- **Top corrections** + **Top tool patterns** (top 5 each, from Insights miners)
- **Recent stuck loops** + **Recent wasted edits**
- **Top projects** by recent activity (sessions × messages × last activity)
- **Hour-of-day distribution** — when in the day you actually use Claude
- **Disk usage** — bar chart per `~/.claude/` subdir, with totals

| Key | Action  |
| --- | ------- |
| `r` | Refresh |

### Insights

The pattern miner. Scans every JSONL in `~/.claude/projects/`, caches the parse to `~/.claude/.cpanel-cache/`, and runs four analyses. Sub-tabs:

| Sub-tab        | What it finds                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Corrections    | User messages matching negative-feedback markers (`no,`, `don't`, `instead of`, `again`, `you keep`, `i told you`, …). Shows the assistant message that triggered each. Repeated markers are candidates for new entries in `~/.files/claude/rules/` or `feedback_*.md` memory files. |
| Patterns       | Recurring 3-to-5 step tool sequences across sessions (e.g. `Bash:git status → Bash:git diff → Bash:git log`). Ranked by occurrences × session-spread × length. High-rank cross-session patterns are skill / bin-script candidates. |
| Stuck Loops    | `file-thrash` (≥5 edits to the same file in <10 min), `repeated-error` (same error string ≥3 times), and `try-cycle` (≥3 consecutive assistant turns starting with "let me try / let me check"). Surfaces sessions where Claude was thrashing. |
| Wasted Work    | `Edit`/`Write` calls later reverted via `git restore`, `git checkout`, `git reset --hard`, or "undo / revert / start over" in user messages. High edit-then-revert counts point at miscommunication or missing context. |

| Key                | Action                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `←` / `→` or `h`/`l` | Cycle sub-tabs                                                                                                  |
| `↑` / `↓` or `j`/`k` | Move within the list                                                                                            |
| `s`                | Scaffold an artifact from the selected finding — `feedback-<slug>.md` rule from a Correction group, or `SKILL.md` from a Pattern. Writes to `~/.files/claude/{rules,skills}/`. Confirm dialog shows path before writing. |
| `r`                | Rebuild conversation cache                                                                                       |

### Conversations

Read every conversation as a rendered chat. List shows AI title (or first user prompt) and last activity; preview shows project/session header, models used, total cost, and the last 200 turns rendered as a thread:

- `you` turns highlighted in orange with the raw text
- `claude` turns in green with markdown-rendered text and inline tool calls (`→ Tool(input)`)
- Tool results shown as compact `⤺ result` lines

| Key       | Action                                  |
| --------- | --------------------------------------- |
| `/` or `f`| Focus filter (title / project / session)|
| `e`       | Open the raw `.jsonl` in `$EDITOR`      |

### Live

Real-time monitor of every Claude Code session on the machine. Polls `~/.claude/sessions/*.json` every 2 s, checks each PID with `kill(pid, 0)`, finds the matching jsonl in `~/.claude/projects/<key>/<sessionId>.jsonl`, tails the last few entries, and shows what Claude is doing right now (latest text or tool call).

| Key | Action                  |
| --- | ----------------------- |
| `p` | Pause / resume polling  |
| `↑↓/jk` | Navigate sessions    |

`●` = alive process, `○` = ended.

### Search

Full-text search across every conversation jsonl using ripgrep.

| Key       | Action                              |
| --------- | ----------------------------------- |
| `i` / `/` | Focus the input                    |
| `esc`     | Leave the input (use list nav)      |
| `⏎`       | Run search                          |
| `↑↓/jk`   | Navigate matches                    |

The preview parses the matched JSONL line and shows the role, timestamp, project, and full text/tool content — so search results land directly in the conversation context.

### Cost

Real `$` cost computed from `tokens × model rate` (Anthropic published rates per Opus / Sonnet / Haiku, including cache read and cache write tiers). Sub-tabs:

| Sub-tab  | What                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| Days     | Per-day cost, with a 30-day sparkline + per-model breakdown                          |
| Projects | Per-project lifetime cost, sessions, messages, last activity, per-model breakdown    |
| Sessions | Most expensive sessions first; preview shows token totals and per-model cost         |

Footer always shows total spend, this-week vs last-week with delta, and any unpriced model names so you know what's missing from the rate table (`src/lib/pricing.ts`).

| Key                | Action          |
| ------------------ | --------------- |
| `←` / `→` or `h`/`l` | Cycle sub-tabs |

### Digest

Daily activity summary derived from the conversation logs. Per day: session count, message count, input/output/cache token totals, projects worked on, tool usage breakdown, most-edited files. Includes a 30-day sparkline of sessions and messages at the top.

### Plans

Browse and edit `~/.claude/plans/*.md` with full markdown rendering (headings, bold, italic, tables, code blocks).

| Key | Action                  |
| --- | ----------------------- |
| `e` | Open in `$EDITOR`       |
| `d` | Delete (with confirm)   |
| `↑↓/jk` | Select               |

### Sessions

Browse `~/.claude/sessions/*.json`. List rows show the **project** (last two cwd segments) with a `●` for live processes; preview shows project, pid, session id, started, kind, entrypoint, size — **plus the git commits made in that cwd within 24 h of the session start**, so you can map a session to the work it produced.

| Key | Action                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------- |
| `r` | Resume in a new terminal window — `claude --resume <sessionId>` in the session's cwd. Tries Ghostty first (or whatever your `$TERM_PROGRAM` is), then falls back to iTerm or Terminal.app. |
| `d` | Delete session record                                                                                   |

### Projects

Every project Claude Code has touched (entries under `~/.claude/projects/`), sorted by total bytes. Preview shows path, size, conversation count, last activity, **token usage aggregated from the conversation logs** (input / output / cache reads / cache creates), and the top models used.

| Key | Action                                |
| --- | ------------------------------------- |
| `d` | Delete all conversation history (with confirm) |

### Settings

Quick access to `settings.json`, `keybindings.json`, `CLAUDE.md`, `agents/`, `skills/`, `rules/`, plus all `~/.claude/backups/.claude.json.backup.*` snapshots in the same list. Files open in `$EDITOR`; directories show their contents inline. Symlinks to `~/.files/claude/` are followed, so edits land in the dotfiles repo. Restoring a backup writes the current `~/.claude.json` to `~/.claude.json.before-restore.<ts>` first.

| Key       | Action                                |
| --------- | ------------------------------------- |
| `e` / `⏎` | Open in `$EDITOR`                     |
| `r`       | Restore selected backup (with confirm)|
| `d`       | Delete selected backup (with confirm) |

### Cleanup

Bundled sweepers for stale data, each preview shows exactly what will be deleted before you confirm:

| Sweep                          | Targets                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| Empty `todos/` files           | Files in `~/.claude/todos/` ≤2 bytes                               |
| All paste-cache                | Everything in `~/.claude/paste-cache/`                              |
| Shell snapshots > 30 days      | Files in `~/.claude/shell-snapshots/` older than 30 days           |
| Backups beyond newest 5        | All but the 5 most recent `.claude.json.backup` files               |
| Telemetry > 14 days            | Telemetry files older than 14 days                                  |

| Key | Action                  |
| --- | ----------------------- |
| `⏎` | Run sweep (with confirm)|

---

## Architecture

```
~/.files/cpanel/
├── package.json              bun project
├── tsconfig.json
├── config.json               cpanel config (symlinked to ~/.config/cpanel/config.json)
├── install.sh                creates the config symlink + bun install
├── README.md                 you are here
└── src/
    ├── index.tsx             createCliRenderer + signal/exit cleanup
    ├── App.tsx               tab router, global keys, sidebar width state
    ├── components/
    │   ├── Header.tsx        clickable tab bar
    │   ├── StatusBar.tsx     bindings hint
    │   ├── ListPane.tsx      width-locked selectable list with right-aligned secondary
    │   ├── PreviewPane.tsx   scrollbox-wrapped preview with overflow:hidden
    │   ├── ConfirmDialog.tsx modal for destructive ops
    │   ├── Splitter.tsx      1-col drag handle
    │   └── SidebarLayout.tsx row container that owns drag state (events bubble here)
    ├── panels/
    │   ├── index.ts          panel registry
    │   ├── types.ts          PanelProps interface
    │   ├── Dashboard.tsx     landing overview cards
    │   ├── Insights.tsx      sub-tabbed analyses + scaffold actions
    │   ├── Conversations.tsx full chat-rendered conversation reader
    │   ├── Live.tsx          real-time session monitor
    │   ├── Search.tsx        ripgrep-backed full-text search
    │   ├── Cost.tsx          $ from tokens × rate (days/projects/sessions)
    │   ├── Digest.tsx        daily activity summary
    │   ├── Plans.tsx
    │   ├── Sessions.tsx      + git commit linkage + resume in terminal
    │   ├── Projects.tsx      + token aggregates
    │   ├── Settings.tsx      + folded-in backups
    │   └── Cleanup.tsx
    └── lib/
        ├── claude.ts         paths to ~/.claude subdirs, glob/read helpers, dashed-key decoder
        ├── format.ts         humanize bytes/dates, sparkline, truncate
        ├── redact.ts         strip email/uuids/api-keys
        ├── editor.ts         spawn $EDITOR (suspends/resumes renderer)
        ├── markdown-style.ts SyntaxStyle for the markdown renderer
        ├── use-scroll.ts     scroll keys + reset-on-selection-change hook
        ├── use-sidebar-width.ts  shared sidebar width state
        ├── spawn-terminal.ts open a new terminal window in cwd with command (Ghostty/iTerm/Terminal)
        ├── pricing.ts        Anthropic model → input/output/cache rate; cost helpers
        ├── config.ts         load ~/.config/cpanel/config.json; isProjectIgnored() filter
        ├── scaffolds.ts      generate feedback-*.md rules and SKILL.md skills from Insights findings
        ├── conversations.ts  JSONL parser + on-disk cache
        └── insights/
            ├── index.ts
            ├── corrections.ts negative-feedback miner
            ├── patterns.ts    tool n-gram miner
            ├── stuck-loops.ts file-thrash, repeated-error, try-cycle
            └── wasted-work.ts edits later reverted
```

### Conversation cache

`loadAllConversations()` walks `~/.claude/projects/*/*.jsonl`, parses each line, extracts role / text / tool_use / tool_result / token usage / timestamp / model, and writes a manifest + parsed conversations to `~/.claude/.cpanel-cache/conversations.json`. On subsequent loads, files whose `mtime` and `size` haven't changed are reused from cache; only modified files are re-parsed. The Insights panel exposes a manual `r` (refresh) that forces a full re-scan.

### Safety

- **All destructive actions go through `ConfirmDialog`** with the exact path(s) and byte count. No silent deletes.
- **Backup restore takes a safety snapshot** of the current `~/.claude.json` before overwriting.
- **Telemetry never renders raw payloads** — only aggregates, with `lib/redact.ts` stripping email, UUIDs, API keys, and bearer tokens defensively.
- **Symlinks respected** — editing `settings.json`/`agents/`/`skills/`/`rules/` opens the real file in `~/.files/claude/`.
- **Terminal restored on quit** — `useKittyKeyboard: null` plus `renderer.destroy()` on q/SIGINT/SIGTERM/exit prevents the kitty kbd protocol from leaking and breaking the terminal.

### Performance

- ~150 conversations / 350 MB parses in well under a second on a modern laptop
- Conversation cache eliminates re-parse on every panel open
- All four insight analyses run in <50 ms once conversations are loaded
- Sub-panels load lazily — the Token usage section in Projects, for example, kicks off after the panel is first opened
