---
name: humanize
description: |
  Strip AI-writing tells and make prose clearer and more concise. Use when editing or reviewing text to sound natural and human, or when writing any prose humans will read: documentation, commit messages, pull request descriptions, error messages, UI copy, help text, comments, reports, explanations. Fixes AI patterns (inflated significance, promotional language, -ing analyses, vague attributions, em dashes, rule of three, AI vocabulary, passive voice, negative parallelisms, filler) and applies Strunk's Elements of Style (active voice, positive form, concrete language, needless words, parallel construction).
---

# Humanize

Two jobs on the same text: remove AI-writing tells (catalog from Wikipedia's "Signs of AI writing", WikiProject AI Cleanup) and make the prose clear and concise (Strunk's _The Elements of Style_). Both run through the loop in Process.

## Ground rules

- **Keep the information, not the shape.** Every claim in the source survives. Compress dull parts, dwell where a human would, merge or split paragraphs freely. When information and the original's structure conflict, information wins.
- **Never invent facts.** No fact, name, number, date, quote, or citation absent from the source. Replace a vague claim with a specific one only if the specific comes from the source or the user; otherwise ask, or write the plain version. Opinions are voice, not facts: where Personality applies you may add stance, never new claims. (Fiction is exempt.)
- **Match the register** (formal, casual, technical).

## Voice calibration

Given a sample of the author's writing, read it first and match its sentence lengths, vocabulary, paragraph openings, punctuation, recurring phrases, and transitions. Don't upgrade casual words or regularize deliberate quirks. A sample outranks this skill's style rules, including §14: if it uses em dashes, keep them at roughly its frequency.

## Personality

Only for blog posts, essays, opinion, personal writing. In encyclopedic, technical, legal, or reference text, neutral and plain is the human voice; add no opinions or first person. Where voice fits, sterile writing is as obvious as slop: allow opinions, uncertainty, mixed feelings, humor, asides, uneven rhythm. Never add factual claims to get there.

## Content patterns

### 1. Inflated significance and legacy

**Watch:** stands/serves as, is a testament/reminder, vital/significant/crucial/pivotal/key role/moment, underscores/highlights its importance, reflects broader, enduring/lasting, contributing to the, setting the stage for, marking/shaping the, represents a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted

> Before: The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain. This initiative was part of a broader movement across Spain to decentralize administrative functions and enhance regional governance.
> After: The Statistical Institute of Catalonia was established in 1989, part of a wider decentralization of administrative functions in Spain.

### 2. Notability and media-coverage claims

**Watch:** independent coverage, local/regional/national media outlets, written by a leading expert, active social media presence. Lists of sources without context.

> Before: Her views have been cited in The New York Times, BBC, Financial Times, and The Hindu. She maintains an active social media presence with over 500,000 followers.
> After: Her views have been cited in The New York Times and the BBC.

If the source gives real context for one citation, keep that one and drop the list. Don't invent context.

### 3. Superficial -ing analyses

**Watch:** highlighting/underscoring/emphasizing, ensuring, reflecting/symbolizing, contributing to, cultivating/fostering, encompassing, showcasing, tacked on for fake depth.

> Before: The temple's color palette of blue, green, and gold resonates with the region's natural beauty, symbolizing Texas bluebonnets, the Gulf of Mexico, and the diverse Texan landscapes, reflecting the community's deep connection to the land.
> After: The temple is painted blue, green, and gold, colors meant to evoke Texas bluebonnets and the Gulf of Mexico.

### 4. Promotional language

**Watch:** boasts a, vibrant, rich (figurative), profound, enhancing its, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking, renowned, breathtaking, must-visit, stunning

> Before: Nestled within the breathtaking region of Gonder in Ethiopia, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage and stunning natural beauty.
> After: Alamata Raya Kobo is a town in the Gonder region of Ethiopia.

### 5. Vague attributions

**Watch:** Industry reports, Observers have cited, Experts argue, Some critics argue, several sources (when few are cited)

> Before: Due to its unique characteristics, the Haolai River is of interest to researchers and conservationists. Experts believe it plays a crucial role in the regional ecosystem.
> After: Researchers and conservationists study the Haolai River for its unusual characteristics.

Name a real source if one exists. Never invent one; cut the unsupported claim.

### 6. Formulaic "challenges and future prospects"

**Watch:** Despite its... faces several challenges, Despite these challenges, Challenges and Legacy, Future Outlook

> Before: Despite its industrial prosperity, Korattur faces challenges typical of urban areas, including traffic congestion and water scarcity. Despite these challenges, with its strategic location and ongoing initiatives, Korattur continues to thrive as an integral part of Chennai's growth.
> After: Korattur has recurring traffic congestion and water shortages.

## Language and grammar patterns

### 7. AI vocabulary

**Watch:** Actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore (verb), valuable, vibrant. They cluster.

> Before: Additionally, a distinctive feature of Somali cuisine is the incorporation of camel meat. An enduring testament to Italian colonial influence is the widespread adoption of pasta in the local culinary landscape, showcasing how these dishes have integrated into the traditional diet.
> After: Somali cuisine also includes camel meat, which is considered a delicacy. Pasta dishes, introduced during Italian colonization, remain common, especially in the south.

### 8. Copula avoidance

**Watch:** serves as/stands as/marks/represents [a], boasts/features/offers [a] in place of is/are/has.

> Before: Gallery 825 serves as LAAA's exhibition space for contemporary art. The gallery features four separate spaces and boasts over 3,000 square feet.
> After: Gallery 825 is LAAA's exhibition space for contemporary art. The gallery has four rooms totaling 3,000 square feet.

### 9. Negative parallelisms and tailing negations

"Not only...but...", "It's not just X, it's Y", and clipped fragments like "no guessing" tacked onto a sentence instead of a real clause.

> Before: It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere. It's not merely a song, it's a statement.
> After: The heavy beat adds to the aggressive tone.

> Before: The options come from the selected item, no guessing.
> After: The options come from the selected item without forcing the user to guess.

### 10. Rule of three

Ideas forced into triplets to seem comprehensive.

> Before: The event features keynote sessions, panel discussions, and networking opportunities. Attendees can expect innovation, inspiration, and industry insights.
> After: The event includes talks and panels. There's also time for informal networking between sessions.

### 11. Synonym cycling

> Before: The protagonist faces many challenges. The main character must overcome obstacles. The central figure eventually triumphs. The hero returns home.
> After: The protagonist faces many challenges but eventually triumphs and returns home.

### 12. False ranges

"From X to Y" where X and Y aren't on a meaningful scale.

> Before: Our journey through the universe has taken us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars to the enigmatic dance of dark matter.
> After: The book covers the Big Bang, star formation, and current theories about dark matter.

### 13. Passive voice and subjectless fragments

Hidden actor or dropped subject. Rewrite when active is clearer.

> Before: No configuration file needed. The results are preserved automatically.
> After: You do not need a configuration file. The system preserves the results automatically.

## Style patterns

### 14. Em and en dashes: cut them

Hard constraint: the final rewrite contains no `—` or `–`, nor spaced ` — ` or ` -- ` used the same way. Replace each, in rough order of preference, with a period, comma, colon, parentheses, or a restructured sentence.

> Before: The new policy — announced without warning — affects thousands of workers. The changes -- long overdue according to critics -- will take effect immediately.
> After: The new policy, announced without warning, affects thousands of workers. The changes, long overdue according to critics, will take effect immediately.

Scan the final for `—` and `–` before returning; any hit means it isn't done. Only exception: an author sample that uses them (Voice calibration).

### 15. Mechanical boldface

> Before: It blends **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and visual strategy tools such as the **Business Model Canvas (BMC)**.
> After: It blends OKRs, KPIs, and visual strategy tools like the Business Model Canvas.

### 16. Inline-header lists

> Before:
> - **Performance:** Performance has been enhanced through optimized algorithms.
> - **Security:** Security has been strengthened with end-to-end encryption.
>
> After: The update speeds up load times through optimized algorithms and adds end-to-end encryption.

### 17. Title case headings

`## Strategic Negotiations And Global Partnerships` → `## Strategic negotiations and global partnerships`

### 18. Emojis on headings or bullets

> Before: 🚀 **Launch Phase:** The product launches in Q3 / 💡 **Key Insight:** Users prefer simplicity
> After: The product launches in Q3. User research showed a preference for simplicity.

### 19. Curly quotes

Use straight quotes: `“on track”` → `"on track"`.

## Communication patterns

### 20. Chatbot correspondence artifacts

**Watch:** I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., Want me to...?, Should I continue?, let me know, here is a...

> Before: Here is an overview of the French Revolution. I hope this helps! Let me know if you'd like me to expand on any section.
> After: The French Revolution began in 1789 when financial crisis and food shortages led to widespread unrest.

### 21. Cutoff disclaimers and speculative gap-filling

**Watch:** as of [date], Up to my last training update, While specific details are limited/scarce, based on available information, not publicly available, maintains a low profile, keeps personal details private, prefers to stay out of the spotlight, likely [grew up/studied/began], it is believed that

Two tells: leftover knowledge-cutoff disclaimers, and a paragraph about missing sources followed by invented filler (for private people, almost always the stock "low profile" phrases). Say what isn't known, or cut the sentence. Same for an unverified cause in a PR body, issue, comment, or commit message: cut it or mark it explicitly as a guess.

> Before: Information about her early life is not publicly available, suggesting she maintains a low profile and keeps personal details private. She likely grew up in a middle-class household, which shaped her later interest in education reform.
> After: Her early life is not documented in the available sources. (Or omit the section.)

### 22. Sycophancy

> Before: Great question! You're absolutely right that this is a complex topic. That's an excellent point about the economic factors.
> After: The economic factors you mentioned are relevant here.

## Filler and hedging

### 23. Filler phrases

- "In order to achieve this goal" → "To achieve this"
- "Due to the fact that" → "Because"
- "At this point in time" → "Now"
- "In the event that" → "If"
- "has the ability to process" → "can process"
- "It is important to note that the data shows" → "The data shows"

### 24. Excessive hedging

"It could potentially possibly be argued that the policy might have some effect" → "The policy may affect outcomes."

### 25. Generic positive conclusions

"The future looks bright... Exciting times lie ahead..." → cut it. End on the last concrete fact; use real plans only if the source states them.

### 26. Uniform hyphenation

**Watch:** third-party, cross-functional, client-facing, data-driven, decision-making, well-known, high-quality, real-time, long-term, end-to-end

AI hyphenates these everywhere. Keep the hyphen when the compound precedes the noun; drop it in predicate position.

> Before: The team is cross-functional, the report is high-quality.
> After: The cross-functional team... The team is cross functional, the report is high quality.

### 27. Persuasive authority tropes

**Watch:** The real question is, at its core, in reality, what really matters, fundamentally, the deeper issue, the heart of the matter. They promise a deeper truth, then restate an ordinary point.

> Before: The real question is whether teams can adapt. At its core, what really matters is organizational readiness.
> After: The question is whether teams can adapt. That mostly depends on whether the organization is ready to change its habits.

### 28. Signposting

**Watch:** Let's dive in, let's explore, let's break this down, here's what you need to know, now let's look at, without further ado. Do the thing instead of announcing it.

> Before: Let's dive into how caching works in Next.js. Here's what you need to know.
> After: Next.js caches data at multiple layers, including request memoization, the data cache, and the router cache.

### 29. Fragmented headers

A one-line paragraph after a heading that restates it ("## Performance / Speed matters.") before the real content. Cut it.

### 30. Diff-anchored writing

**Watch:** previously, used to, instead of X, we considered, not X — Y, we're NOT using X

Describe the present state as if no prior state existed. When something is dropped, drop it entirely; no "no longer used" markers. Exception: inherently version-scoped documents (changelogs, release notes, migration guides, external deprecation notices).

> Before: This function was added to replace the previous approach of iterating through all items, which caused O(n²) performance.
> After: This function uses a hash map for O(1) lookups, avoiding the O(n²) cost of naive iteration.

### 31. Manufactured punchlines and staccato drama

Every sentence landing like a closer, or runs of short fragments. One short emphatic sentence is fine; a run sounds engineered.

> Before: Then AlphaEvolve arrived. It had no preference for symmetry. No aesthetic prior. No nostalgia for human taste. The old rules were gone.
> After: AlphaEvolve changed the search because it did not favor symmetry or human-looking designs. That made some of the older assumptions less useful.

### 32. Aphorism formulas

**Watch:** X is the Y of Z, X becomes a trap, X is not a tool but a mirror, the language/currency/architecture of. Replace with the concrete claim.

> Before: Symmetry is the language of trust. Efficiency becomes a trap when teams forget the human layer.
> After: Symmetric layouts often feel more predictable to users. Teams can over-optimize workflows and miss how people actually use them.

### 33. Fake-candid openers

**Watch:** Honestly?, Look, Here's the thing, The thing is, Let's be honest, Real talk, as standalone hooks before a routine point.

> Before: Is it worth the price? Honestly? It depends on how often you'll use it.
> After: Whether it's worth the price depends on how often you'll use it.

## Detection

### Not tells on their own

Look for clusters, not isolated hits. Don't gut legitimate prose for:

- Perfect grammar or polish; formal or academic vocabulary beyond the §7 list
- Mixed casual and formal registers
- Dry prose without specific tells
- Letter-style openings or sign-offs
- A single transition word (one *however*); these count only when piled up
- Curly quotes alone (editors auto-curl) or em dashes alone; each counts only alongside other tells
- One short emphatic sentence; "honestly" or "look" mid-sentence
- Unsourced claims; clean complex formatting
- Watched phrases inside quotations, titles, proper names, or examples that discuss the phrase

### Signs of a human (leave alone)

- Specific, odd, hard-to-fabricate detail ("the lawyer who used to work upstairs from my dentist")
- Mixed feelings and unresolved tension
- Era-bound slang, memes, in-jokes
- Editorial choices the writer can defend
- Varied sentence length
- Genuine asides and self-corrections
- Text dated before November 30, 2022 (ChatGPT's launch)

## Clarity and concision (Strunk)

Apply to any prose a human will read, inside the same loop. `usage.md` holds Strunk's misused-words list (Section V); consult it for specific usage questions.

### Usage

1. Possessive singular takes 's whatever the final consonant: Charles's, Burns's. Exceptions: ancient names in -es/-is, Jesus', for conscience' sake. Pronoun possessives (hers, its, theirs) take no apostrophe.
2. Serial comma: red, white, and blue. Firm names omit it (Brown, Shipley & Co.).
3. Enclose parenthetic expressions between two commas, never one. Non-restrictive clauses take commas ("The audience, which had been indifferent, ..."); restrictive ones don't ("The candidate who best meets..."). Also set off the year in a date, the day after a weekday, etc., jr.
4. Comma before a conjunction joining independent clauses (and, but, for, or, nor, as=because, while=and at the same time). With a shared subject: comma before *but*, none before *and* when the link is close.
5. Don't join independent clauses with a comma; use a semicolon or period. Adverbs (therefore, thus, then, besides) still need the semicolon. Exception: very short parallel clauses ("Man proposes, God disposes").
6. Don't break sentences in two ("He was an interesting talker. A man who had traveled..."). A deliberate emphatic fragment is allowed only when the emphasis is warranted.
7. An opening participial phrase must refer to the subject. Wrong: "On arriving in Chicago, his friends met him." Right: "When he arrived in Chicago, his friends met him."

### Composition

8. One paragraph per topic. Single-sentence paragraphs only for transitions or in reference text; new paragraph per speaker in dialogue.
9. Open each paragraph with a topic sentence; develop it; end on its point or consequence, never a digression.
10. Prefer active voice; passive is fine when the receiver is the topic. Don't stack passives ("Gold was not allowed to be exported" → "The export of gold was prohibited"), and don't make the action the subject ("A survey of this region was made" → "This region was surveyed"). Replace *there is* / *could be heard* with a real verb ("Dead leaves covered the ground").
11. Positive form: say what is. "not honest" → dishonest, "did not remember" → forgot, "was not very often on time" → usually came late. *Not* for denial or antithesis, never evasion.
12. Specific, definite, concrete: "A period of unfavorable weather set in" → "It rained every day for a week." Give particular instances even for general principles.
13. Omit needless words; make every word tell (short sentences aren't required). "the question as to whether" → whether; "in a hasty manner" → hastily; revise out *the fact that* ("owing to the fact that" → because); drop superfluous *who is* / *which was*. Combine a step-by-step series of sentences that express one idea.
14. Avoid runs of loose two-clause sentences joined by and/but/so/which/while; recast some for variety.
15. Parallel form for coordinate ideas. Repeat an article or preposition before every term or only the first ("in spring, summer, or winter"). Correlatives (both/and, not/but, either/or, first/second) take the same construction: "The ceremony was both long and tedious."
16. Keep related words together: don't split subject and verb with a movable phrase; put the relative pronoun right after its antecedent; put modifiers next to what they modify ("He found only two mistakes").
17. In summaries, keep one tense (present preferred; perfect for prior action). State once that it's a summary; skip repeated "he said" tags.
18. Put the emphatic word, usually the new information, at the end of the sentence: "Because of its hardness, this steel is used for razors." The start is the secondary emphatic position.

## Invocation modes

- **Pasted text (default):** deliver the draft, brief "still-AI" bullets, the final rewrite, and optionally a short change summary.
- **File:** run the loop internally, rewrite the file in place with only the final text. Touch prose only: leave code blocks, frontmatter, data, and link targets alone. Report a short summary, not the rewrite.
- **Embedded** (one step of a larger task such as a PR description or commit message): run the loop internally and output only the final text.

## Process

1. Find every instance of the patterns above.
2. Write a draft rewrite: reads naturally aloud, varied sentence length, simple constructions (is/are/has), right register.
3. Ask: "What makes this obviously AI generated?" and "Does it state any fact, name, number, date, or citation not in the source?" Answer briefly. A fabrication is a defect even when it sounds more human.
4. Revise into the final rewrite, with no em or en dashes (§14). Don't hard-wrap: one paragraph or bullet per line. Break lines only where the break carries meaning (code, diagrams, fixed-width output, commit subject lines).
