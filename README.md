# Pochoir, an Obsidian Plugin

**Pochoir** is a template plugin for Obsidian (https://obsidian.md).

## Status

This plugin is very experimental and I use it only for my use cases. If you are looking for a more mature alternative, I recommand [Templater](https://github.com/SilentVoid13/Templater).

## Why?

I wanted to create a plugin similar to [Templater](https://github.com/SilentVoid13/Templater) but with less scripting and has features out-of-the-box.

## Features

This plugin provides two approachs:
- Write template without code with special properties prefixed with `$.`
- Write complex template with javascript code block

### Change note path

Use `$.path` property to change note file path.

**Example**

Here an example for a unique note template

```md
---
tags:
- inbox
$.path: "inbox/{{date.today('YYYYMMDDHHmm')}}"
---
```

### Merge properties from another template

Use `$.properties` property to inherits properties from specified list templates.

**Example**

In this template, I want to inherits properties from `[[AnotherTemplate]]`.

```md
---
tags:
- my-tag
$.properties:
- "[[AnotherTemplate]]"
---
```

### Import functions or variables from another template

Use `$.exports` property to inherits exports from specified list of templates.

**Example**

I have a function `fullname()` in `[[Functions]]` and I want to use it for my template

```md
---
author: "{{fullname()}}"
$.exports:
- "[[Functions]]"
---
```

### Select a template with its aliases

Use `$.aliases` property to give a list of aliases to the template

**Example**

I want the alias `tsk` to select `[[Task Template]]` from the template picker.

```md
---
date: "{{date.today()}}"
tags:
- task
$.aliases:
- tsk
---
```

### Create form and use the result

You can create a form with the custom codeblock `form`.

The codeblock accepts these attributes:
- **pochoir** required, to be evaluated by the plugin and not rendered to your note
- **disabled** to not evaluate the code block and not render to your note
- **name="form"** to assign a name to your form and access the form in Javascript code blocks
- **exports="form"** to expose the form to template renderer or another template

**Example**

In this example, I will prompt a form modal with two fields `title` and `birthday`.

After validation, my note will be created with `myform.*` data filled.

````md
---
title: {{myform.title}}
---

```form {pochoir exports=myform}
title:
  type: text
  defaultValue: Untitled
birthday:
  type: date
```

My birthday is {{myform.birthday}};
````

## More information

For more complex templates, check the `./demo` vault.

## Inspiration

* [Templater](https://github.com/SilentVoid13/Templater)
* [Modal Form](https://github.com/danielo515/obsidian-modal-form/)
* [Varinote](https://github.com/gsarig/obsidian-varinote)
