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
title: Create daily note
icon: pen
action: create
triggers:
- ribbon
- command
```

