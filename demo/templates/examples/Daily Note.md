---
tags:
- template
---
```pochoir-props
date: "{{date.today()}}"
tags:
- inbox
$.path: "Daily/{{date.today('YYYY-MM-DD')}}"
$.options:
  - openIfExists
  - confirmName
```

```pochoir-command
id: create-daily-note
title: Open today's daily note
icon: calendar
action: create
triggers:
- ribbon
- command
```

