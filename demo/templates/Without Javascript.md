---
up: "[[Tasks.base]]"
title: "{{path.basename}}"
date: "{{date.today()}}"
due: "{{form.due}}"
complete: false
tags:
  - task
$.aliases:
  - tsk
  - nojs
$.path: outputs/{{date.today('YYYYMMDDHHmm')}}
---
```pochoir-form exports="form"
due:
  type: date
```

```pochoir-command
id: task
icon: square-check-big
title: Create Task
action: create
triggers: 
- ribbon
- command
```

Some content