---
name: brainstorming
description: "Gathers requirements through structured questions, proposes 2-3 approaches with trade-offs, and presents designs incrementally for validation. Use when the user requests a new feature without clear requirements, asks to plan a component, or needs help defining scope before coding."
user-invocable: false
---

# Brainstorming Ideas Into Designs

Turn ideas into validated designs through collaborative dialogue — one question at a time.

## The Process

**Understanding the idea:**

- Check current project state first (files, docs, recent commits)
- Ask questions one at a time — prefer multiple choice when possible
- Focus on: purpose, constraints, success criteria

Example question sequence:
> "What should happen when the API call fails? A) Retry 3 times with backoff B) Show error to user immediately C) Fall back to cached data"

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Lead with your recommended option and explain why

**Presenting the design:**

- Break into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing

Example design section:
> **Data Flow**: User submits form → validate client-side → POST to `/api/resource` → service validates + persists → return created resource with ID → redirect to detail view. On validation failure, return 422 with field-level errors displayed inline.

## After the Design

- Write the validated design to a plan file using `writing-clearly-and-concisely` skill
- Ask: "Ready to start planning implementation?" → use `planning` skill

## Key Principles

- **YAGNI ruthlessly** — remove unnecessary features from all designs
- **Incremental validation** — present design in sections, validate each
