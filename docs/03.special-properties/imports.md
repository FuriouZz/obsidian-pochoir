---
title: Imports
---
# Imports

Use `$.imports` to import variables from another template.

The property accepts a **list** of templates.

> [!warning]
> To write expose variables/functions you need to enable `pochoir-js` in plugin settings.
> See [JavaScript API](/javascript) for more information.

## Example

### Share variables to multiple template

Here a template exporting a function:

````md {filename="Functions.md"}
```pochoir-js
template.exports.fullname = () => {
    return "John Doe";
};
```
````

I can import functions from the template below with `$.imports`;

{{echo}}
```md {filename="Another Template.md"}
---
author: "{{fullname()}}"
$.imports:
- "[[Functions]]"
---
```
{{/echo}}

Output:

```md {filename="Note.md"}
---
author: "John Doe"
---
```

