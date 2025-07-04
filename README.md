# Pochoir, an Obsidian Plugin

**Pochoir** is a template plugin for Obsidian (https://obsidian.md).

## Status

This plugin is very experimental and I use it only for my use cases. If you are looking for a more mature alternative, I recommand [Templater](https://github.com/SilentVoid13/Templater).

## Template layout

A basic template is a note placed in the `template_folder`.

Exception for the template properties and pochoir code blocks, every content will by copied, rendered and paste in your created note.

## Example: Task template

In this template, I want to:
- Open a form to set the task title
- Add some properties
- Select the template via its aliases `tsk` or `task`

````md
---
tags:
  - template
aliases:
  - tsk
  - task
---


```js {pochoir}
const form = pochoir.form.create();
form.text("title").defaultValue("Task");
exports.form = await form.prompt();
```

```yaml {pochoir}
up: "[[Tasks.base]]"
title: "{{form.title}}"
date: {{date.today("YYYY-MM-DD")}}
start: {{date.today("YYYY-MM-DD")}}
complete: false
tags:
  - task
```

## {{form.title}}
````

## Example: Share variables and functions

In this example, I want to:
- Add a `created` property
- Add a function `zid()` to generate a zettlekasten id

Let's start by creating a note `Functions.md` in your `template_folder`.


````md
```js {pochoir}
pochoir.properties.created = pochoir.date.today();
```

```js {pochoir}
exports.zid = () => {
    return pochoir.date.today("YYYYMMDDHHMM");
}
```
````

Now, we can update our `Task Template.md`, include `Functions.md` and use our `zid()` in the `title` property.

````md
---
tags:
  - template
aliases:
  - tsk
  - task
---


```js {pochoir}
const form = pochoir.form.create();
form.text("title").defaultValue("Task");
exports.form = await form.prompt();
```

```js {pochoir}
await pochoir.include("[[Functions]]");
```

```yaml {pochoir}
up: "[[Tasks.base]]"
title: "{{zid()}} {{form.title}}"
date: {{date.today("YYYY-MM-DD")}}
start: {{date.today("YYYY-MM-DD")}}
complete: false
tags:
  - task
```

## {{form.title}}
````

## Inspiration

* [Templater](https://github.com/SilentVoid13/Templater)
* [Modal Form](https://github.com/danielo515/obsidian-modal-form/)
* [Varinote](https://github.com/gsarig/obsidian-varinote)
