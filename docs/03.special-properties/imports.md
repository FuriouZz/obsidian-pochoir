---
title: Imports
---
# Imports

Use `$.imports` to import variables from another template.

The property accepts a **list** of templates.

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

```md {filename="Anoter Template.md"}
---
author: "{{fullname()}}"
$.imports:
- "[[Functions]]"
---
```

Output:

```md {filename="Note.md"}
---
author: "John Doe"
---
```

