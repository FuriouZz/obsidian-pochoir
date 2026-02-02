```pochoir-snippet name="bookmark"
#bookmark {^}
```

```pochoir-snippet name="today"
{{date.today("YYYY-MM-DD")}}{^}
```

```pochoir-snippet name="now"
{{date.today("HH:mm")}}{^}
```

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
```

