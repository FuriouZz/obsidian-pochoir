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
$.path: tasks/{{date.today('YYYYMMDDHHmm')}}
$.command: true
---
```form {pochoir exports=form}
due:
  type: date
```

Some content