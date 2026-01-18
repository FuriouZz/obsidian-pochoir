---
tags:
- template
---
```pochoir-props
date: "{{date.today()}}"
tags:
- inbox
$.path: "{{date.today('YYYYMMDDHHmm')}} {{path.basename}}"
```

```pochoir-command
id: create-unique-note
title: Create unique note
icon: file-pen
action: create
triggers:
- ribbon
- command
```
