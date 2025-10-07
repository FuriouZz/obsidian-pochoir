---
hide_menu: false
title: Command
---
# Command

The `pochoir-command` code block allows you to trigger a template from the [command palette](https://help.obsidian.md/plugins/command-palette) and/or a [ribbon](https://help.obsidian.md/ribbon).

**You need to enable `pochoir-command` code block in plugin settings.**

{{#

{{ comp flex }}
    {{ comp video { src: "/assets/demo-editor-menu.mp4" } /}}
{{ /comp }}

#}}

For example, let's add a ribbon action to create a new unique note from `[[Unique note template]]`:

````md
```pochoir-command
id: create-unique-note
title: Create unique note
icon: file-pen
action: create
trigger: ribbon
```
````

## Attributes

The code block only accept the `disabled` attribute to ignore it.

## Options

### id

Useful if you want to trigger the command from another plugin.

If not provided, it is generated from `title` property or template `basename`.

> [!warning]
> It is recommanded to write your `id` in [kebab case](https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case)
> for consistency with others [Obsidian Commands](https://docs.obsidian.md/Plugins/User+interface/Commands)
> and must be different with other templates.

````md
```pochoir-command
id: create-unique-note
```
````

### title

This is the command title used for the command palette and the ribbon action.

If not provided, it is generated from template `basename`.

````md
```pochoir-command
title: Create unique note
```
````

### icon

Set a [lucid icon](https://lucide.dev/icons/) for the ribbon action.

If not provided, [file-question-mark](https://lucide.dev/icons/file-question-mark) is used.

````md
```pochoir-command
title: Create task
icon: square-check-big
trigger: ribbon
```
````

### action

Configure how to apply the template.

Values accepted (by default, the value is **create**):
- **create**
- **insert**

````md
```pochoir-command
title: Insert task
action: insert
icon: square-check-big
trigger: command
```
````

### trigger/triggers

Configure how to trigger your command. It can be a **text** or a **list of texts**.

Only two values are accepted: **ribbon** and **command**. By default, the value is **command**.

> [!tip]
> To prevent errors, **trigger** and **triggers** options are equivalent and both accept a **text** or a **list**.

For example, to register a command with two triggers:

````md
```pochoir-command
title: Create task
icon: square-check-big
triggers:
- ribbon
- command
```
````

and another example, with a single one:

````md
```pochoir-command
title: Create task
trigger: command
```
````

### template/templates

TODO

````md
```pochoir-command
title: Replace selection
action: insert
trigger: editor-menu
template: selection()
```
````

````md
```pochoir-command
title: Insert from clipboard
action: insert
trigger: editor-menu
template: clipboard()
```
````

````md
```pochoir-snippet name="My snippet" id="my-snippet"
hello world
```

```pochoir-command
title: Insert from clipboard
action: insert
trigger: editor-menu
template: snippet(my-snippet)
```
````
