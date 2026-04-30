# PR Format

When work is complete on a feature branch:

## Title

```
feat: short description
```

## Body

Keep it high level. The reviewer reads the diff — don't repeat technical details they'll see there.

```
Brief description of what and why.

Closes #123
```

### Rules

| Do                                          | Don't                                         |
| ------------------------------------------- | --------------------------------------------- |
| Explain the _why_ (motivation, context)     | List files/functions changed                  |
| Summarize the user-visible outcome          | Walk through the implementation step by step  |
| Link the issue (`Closes #123`)              | Quote code or paste diff snippets             |
| Note anything non-obvious from the diff     | Restate what's already obvious in the diff    |

## Final Checklist

Before declaring done:

- [ ] Requirements met
- [ ] Follows existing patterns (verified by reading nearby code)
- [ ] Debug code removed
- [ ] Tests pass
- [ ] New tests written for new functionality
- [ ] Formatters run
- [ ] `git diff` reviewed
- [ ] Documentation updated if behavior changed
