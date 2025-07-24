---
title: Imports
---
# Imports

Use `$.imports` to import variables from another template.

The property accepts a **list** of templates.

## Example

### Share variables to multiple template

I have this template `[[Functions]]`:

````md {filename="[[Functions]]"}
```pochoir-js
template.exports.fullname = () => {
    return "John Doe";
};
```
````

I can import "[[Functions]]" and use its exported functions:

```md
---
author: "{{fullname()}}"
$.imports:
- "[[Functions]]"
---
```

Output:

```md
---
author: "John Doe"
---
```

