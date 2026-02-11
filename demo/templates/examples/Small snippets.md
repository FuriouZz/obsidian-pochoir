---
tags:
  - template
---
```pochoir-snippet name="bookmark" hidden
---
$.imports:
- "[[Utilities]]"
---
#bookmark [{^}]({{ await clipboard() }})
```

```pochoir-snippet name="today" hidden
{{date.today("YYYY-MM-DD")}}{^}
```

```pochoir-snippet name="now" hidden
{{date.today("HH:mm")}}{^}
```

```pochoir-snippet name="link" hidden
---
$.imports:
- "[[Utilities]]"
---
[[{{selection()}}]]{^}
```

````pochoir-snippet name="daily-note" hidden
---
date: "{{date.today()}}"
tags:
- inbox
$.path: "Daily/{{date.today('YYYY-MM-DD')}}"
$.options:
  - openIfExists
  - confirmName
---
````

```pochoir-command
title: Small snippets
action: insert
icon: pochoir-icon
triggers: 
- command
- editor-menu
templates:
- snippet(bookmark)
- snippet(today)
- snippet(now)
- snippet(daily-note)
- snippet(link)
```

