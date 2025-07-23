---
title: Import variables
---
# Import variables

Use `$.imports` to import variables from another template.

The property accepts a **list** of templates.

## Example: Share variables to multiple template

I have a template `[[Functions]]` with the function `fullname()`:

````md
```pochoir-js
template.exports.fullname = () => {
    return "John Doe";
};
```
````

Now, I can import "[[Functions]]" and use the `fullname()` function in my template:

```md
---
author: "{{fullname()}}"
$.exports:
- "[[Functions]]"
---
```

Output:

```md
---
author: "John Doe"
---
```

