---
id: "{{zid()}}"
$.imports:
  - "[[Functions]]"
$.path: outputs/{{date.today('YYYYMMDDHHmm')}}
---
```pochoir-js
template.exports.addCreated(template.properties);
```

{{message()}}