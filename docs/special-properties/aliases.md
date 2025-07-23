---
order: 1
title: Assign aliases
---
# Assign aliases

Use `$.aliases` property to give a **list** of aliases to the template.

## Example: Use the alias `tsk` to trigger a template

In the template picker, I can type `tsk` to preselect the following template:

```md
---
date: "{{date.today()}}"
tags:
- task
$.aliases:
- tsk
---
```
