---
tags:
  - template
---
```pochoir-form exports=data
title:
  label: Title
  type: text
source:
  label: Source
  type: text
tags:
  label: Tags
  type: text
```

```pochoir-props
source: "{{data.source}}"
date: "{{date.today()}}"
tags:
  - bookmark
  - {{data.tags.split(' ').join('\n  - ')}}
$.path: References/Bookmarks/{{date.today('YYYYMMDDHHmm')}} {{data.title}}
$.aliases:
  - bmk
```

```pochoir-command
id: create-bookmark
title: Create bookmark
action: create
icon: bookmark
triggers:
- command
- ribbon
```
