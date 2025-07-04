---
tags:
  - template
aliases:
  - tsk
---
```yaml {pochoir}
up: "[[Tasks.base]]"
title:
date: {{date.today("YYYY-MM-DD")}}
start: {{date.today("YYYY-MM-DD")}}
complete: false
tags:
- task
```

{{date.today()}}