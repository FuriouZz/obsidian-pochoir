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
```form {pochoir type=form exports=form}
due:
  type: date
```

```yaml {pochoir type=command}
id: task
icon: square-check-big
title: Create Task
action: create
triggers: 
- ribbon
- command
```

Some content