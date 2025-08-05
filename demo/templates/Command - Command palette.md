---
tags:
  - inbox
---
```pochoir-command
title: Create note
action: create
trigger: command
```

```yaml
## Evolution?
title: Create from snippet
action: create
trigger: command
filter:
  and:
    - file.hasTag("snippet")
```