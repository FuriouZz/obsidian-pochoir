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
```form {pochoir exports=form}
due:
  type: date
```

```yaml {pochoir type=ribbon}
icon: square-check-big
title: Task
action: create
```

Some content