---
order: 1
title: Properties
---
# Properties

Use `template.properties` to read/write properties:

````md
```pochoir-js
template.properties.author = "John Do";
```
````

Output:
````md
---
author: "John Do"
---
````

Alternatively, you can use [$.properties](/special-properties/properties) property.

## The frontmatter builder

Use `template.$properties` for more complex use case, like inserting tag to `tags` property:

````md
```pochoir-js
template.$properties.insertTo("tags", "bookmark");
```
````

Output:
````md
---
tags:
- bookmark
---
````

### Full example

````js
// Set property
template.$properties.set("author", "John Doe");

// Remove property
template.$properties.delete("author", "John Doe");

// Add bookmark to the list `tags`
template.$properties.insertTo("tags", "bookmark");

// Remove bookmark to the list `tags`
template.$properties.removeTo("tags", "bookmark");

// Get list `tags` (returns string[])
const tags = template.$properties.list("tags");
console.log(tags);

// Remove all properties
template.$properties.clear();

// Merge with an object
template.$propertes.merge({
    author: "John Doe",
    tags: ["bookmark"]
});

// Merge yaml string
template.$properties.merge(`
author: John Doe
tags:
- bookmark
`);

// Clone properties
const cloned = template.$properties.clone();
cloned.set("age", "34");

// Merge with another PropertyBuilder
template.$properties.merge(cloned);

// Get an object (returns Record<string, unknown>)
const properties = template.$properties.toObject();

// Get a yaml string (returns string)
const yaml = template.$properties.toYAML();
````

## Merge properties from another template

Sometime you want to insert properties from a template to another one. There's multiple way to do that, but first we will expose the wrong way with the following example.

We have two templates `[[Template 1]]` and `[[Template 2]]`:

With `[[Template 1]]`, a function `createdAt` is exported. This function inserts `created-at` property:

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.exports.createdAt = () => {
    template.properties["created-at"] = today('YYYY-MM-DD');
};
```
````

And we use `createdAt` in `[[Template 2]]`:

````md
```pochoir-js
const { createdAt } = await template.import("[[Template 1]]");
createdAt();
```
````

You may expect this result, but this is not the case:

````md
---
created-at: 2025-07-23
---
````

Because `template.properties` in `[[Template 1]]` does not belong to `[[Template 2]]` context but the former.

You need to provide `[[Template 2]]` properties object:

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.exports.createdAt = (properties) => { // 👈
    properties["created-at"] = today('YYYY-MM-DD'); // 👈
};
```
````
````md
```pochoir-js
const { createdAt } = await template.import("[[Template 1]]");
createdAt(template.properties); // 👈
```
````

An alternative way would be to expose an object
````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.exports.properties = {
    get ["created-at"]() {
        return today("YYYY-MM-DD"):
    },
}; // 👈
```
````

````md
```pochoir-js
const { properties } = await template.import("[[Template 1]]");
template.$properties.merge(properties); // 👈
```
````

Or to expose a more exportable function:

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.exports.createdAt = () => today('YYYY-MM-DD'); // 👈
```
````

````md
```pochoir-js
const { createdAt } = await template.import("[[Template 1]]");
template.properties["created-at"] = createdAt(); // 👈
```
````
