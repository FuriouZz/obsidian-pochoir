---
order: 1
title: Aliases
---
# Aliases

Use `$.aliases` property to give a **list** of aliases to the template.

## Example

### Use `tsk` alias to trigger a template

In the template picker, I can type `tsk` to preselect the following template:

{{echo}}
```md
---
date: "{{date.today()}}"
tags:
- task
$.aliases:
- tsk
---
```
{{/echo}}
