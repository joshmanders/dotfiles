# Deleting Files

## **Delete with a relative path.**

`cd` into the directory that holds the thing, then remove it relative to that directory.

**Why:** The guard's `rm` pattern covers the entire home tree, not just system directories — every path under `/Users/josh/` trips it, including every repo. The absolute path buys nothing the relative one doesn't, so writing it is a blocked command in exchange for zero benefit.

**How to apply:**

- The shape is `cd <dir> && rm -rf ./thing`.
- Absolute paths starting with any of these are blocked: `/home` `/Users` `/etc` `/bin` `/sbin` `/usr` `/System` `/Library` `/boot` `/opt` `/var/log` `/var/lib` `/var/root` `/private/etc` `/private/var/log` `/private/var/lib`. `sudo` in front changes nothing.
- Absolute paths under `/tmp`, `/private/tmp`, and `/var/folders` pass — scratch space is fine to address absolutely.
- Relative paths always pass.
- This applies to repo paths too. A file inside a project is under `/Users/josh/`, so it's covered.

---

## **A `BLOCKED:` message means rewrite the command, not hand it to Josh.**

The guard is reporting that the *shape* of the command is wrong, not that the deletion is forbidden. Rewriting it into an allowed shape is the work.

**Why:** Josh: "our guard has been flagging a lot of your deletes because you use absolute values and you should be using relative — and instead of doing that, you just stop and go 'run this delete for me.' No, you should be doing things the safe way." He delegated the deletion. Handing it back as a chore because a guard fired is refusing the task, and it costs him more than the delete would have.

**How to apply:**

- Read the message, fix the path, re-run. That's the whole loop.
- Never say "can you run this for me" about a delete.
- Never route around the guard — no `sudo`, no bypass of any kind. See `prime-directives.md`.
- If a delete genuinely can't be expressed in an allowed form, ask Josh with the specific reason it can't. Not a blanket handoff.
