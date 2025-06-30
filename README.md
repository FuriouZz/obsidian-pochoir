# Pochoir, an Obsidian Plugin

**Pochoir** is a template plugin for Obsidian (https://obsidian.md).

## Status

[Templater](https://github.com/SilentVoid13/Templater) is a very mature and nice plugin for templating in Obsidian.

But it have some limitations and I wanted to explore another way to create from a template.

Here a couple of limitations, I want to improve in this plugin:
- Need too much code for property merging
- User function are in `.js` files

Solutions:
- Like the core `Template` plugin, I want to property merging easy
- Separate template code and configuration and template content

## Example

The proposal is to add another section between the note frontmatter and the note content.

In this section, we can write and document template properties, code and configuration via `codeblocks`.

To create a template, your file must be divided in 3 sections delimited by `---` separator:

````md
---
Template properties
---
Template code blocks
---
Template content
```

Here an example:

```md
---
tags:
- template
---

I directly document my template here.

I can use a javascript block to expose variable to my template:

```js pochoir
exports.message = "Hello World";
```

I can define properties to merge to my note

```yaml pochoir
title: Template 1
number: 1
boolean: true
date: {{date.today()}}
tags:
- inbox
```


I can define properties programatically

```js pochoir
pochoir.properties.title = "Template 1";
pochoir.properties.number = 1;
pochoir.properties.boolean = true;
pochoir.properties.date = pochoir.today();
pochoir.$properties.insertTo("tags", "inbox");
```

We can import another template and use its variables, functions and content

```js pochoir
const math = await include("[[Math Functions]]");
exports.operation = math.exports.sum(1, 2);
```
---

# {{properties.title}}

{{exports.message}}

1 + 2 = {{exports.operation}}

{{ include "[[Template 2]]" }}
````

## Alternatives

* [Templater](https://github.com/SilentVoid13/Templater)
