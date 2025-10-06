---
order: 1
title: Imports and exports
---
# Imports and exports

## Exporting

Use `template.exports` object, to expose variables or functions to your template.

{{echo}}
````md
```pochoir-js
template.exports.who = "John Doe";
```

I am {{who}}.
````
{{/echo}}

Output:

````md
I am John Doe.
````

You can even export a function use it in properties

{{echo}}
````md
---
author: "{{fullname()}}"
---

```pochoir-js
template.exports.fullname = () => {
    return "John Doe";
};
```

Article created by {{fullname()}}.
````
{{/echo}}

Output:
````md
---
author: "John Doe"
---

Article created by John Doe.
````

## Importing

`template.exports` is also useful combined with `template.import()` to share code between template:

Here a template `[[Functions]]`:

````md
```pochoir-js
const age = 34;
template.exports.fakeAge = () => {
    return age - 4;
};
```
````

and another template:

{{echo}}
````md
```pochoir-js
const { fakeAge } = await template.import("[[Functions]]");
template.exports.age = fakeAge;
```

I am {{age()}} years old.
````
{{/echo}}

Output:
````md
I am 30 years old.
````
