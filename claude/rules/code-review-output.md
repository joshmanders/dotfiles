# Code Review Output

## **Only surface actionable items. No narration, no affirmations.**

When reviewing code, the output is a list of things that need action. It is not a tour of the diff, not a recap of what changed, not a list of files looked at, not a sequence of "this looks good" assurances.

**Why:** Josh has corrected this repeatedly. Narration and affirmations are noise — they dilute the signal of the actual concerns, force him to scan past filler to find what matters, and read as performative effort rather than judgment.

**How to apply:**
- Skip files with no issues. Do not mention them.
- Do not narrate what the code does ("Changed X to Y", "Aligns with the new accessor", "Renames the helper").
- Do not affirm ("Correct.", "Clean.", "Well designed.", "Sound architecture.", "Good separation of concerns.").
- Do not add filler praise or feel-good commentary.
- Report only: bugs, concerns, risks, and items that need action.
- If nothing is wrong, say so in one line. That's the whole review.

The shape of a good review when issues exist is a list of concerns with file:line references. The shape of a good review when nothing is wrong is one sentence.
