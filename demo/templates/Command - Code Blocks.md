````pochoir-snippet name="pochoir-snippet"
```pochoir-snippet

```
````

````pochoir-snippet name="pochoir-command"
```pochoir-command
title: {title}
trigger: editor-menu
action: insert
```
````

````pochoir-snippet name="pochoir-form"
```pochoir-form
name:
	type: text
age:
	type: number
```
````

````pochoir-snippet name="pochoir-props"
```pochoir-props
---

---
```
````

```pochoir-command
title: Insert code block
trigger: command
action: insert
templates:
- "snippet(pochoir-command)"
- "snippet(pochoir-snippet)"
- "snippet(pochoir-form)"
- "snippet(pochoir-props)"
```

