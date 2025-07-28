# Pochoir, an Obsidian Plugin

Pochoir is an [Obsidian](https://obsidian.md/) plugin for note templating.

With simplicity in mind, we want note templating made easy, with few configurations and no coding experience.

## Status

This plugin is very experimental and I use it only for my use cases.

If you are looking for a more mature alternative, I recommand [Templater](https://github.com/SilentVoid13/Templater).

## Getting Started

Follow the instruction on the [webpage](https://furiouzz.github.io/obsidian-pochoir/).

## Example

### Create a unique note

The following example do:
- Create a new note at path `Inbox/YYYYMMDDHHmm.md`
- Include `date` and `tags` properties
- Register the template to a ribbon action

````md
---
date: "{{date.today('YYYY-MM-DD')}}"
tags:
- inbox
$.path: "Inbox/{{date.today('YYYYMMDDHHmm')}}"
---

```pochoir-command
id: create-unique-note
title: Create Unique Note
action: create
trigger: ribbon
```
````

### Create a task note

The following example do:
- Create a form that will be displayed at template execution
- The value `form.due` is filled by the form result
- `date`, `due`, `complete` and `tags` properties are included to the note
- Register an alias `tsk` for a quicker suggestion in the template list
- Create the note at path `References/Tasks/YYYYMMDDHHmm.md`

````md
---
date: "{{date.today('YYYY-MM-DD')}}"
due: "{{form.due}}"
complete: false
tags:
- tasks
$.aliases:
- tsk
$.path: "References/Tasks/{{date.today('YYYYMMDDHHmm')}}"
---

```pochoir-form exports=form
due:
  type: date
```
````

### More examples

For more example, we invite you to check the `./demo` vault or to read the [documentation](https://furiouzz.github.io/obsidian-pochoir/).

## Dependencies
- [ventojs](https://github.com/ventojs/vento)
- [valibot](https://valibot.dev/)

## Inspiration

* [Templater](https://github.com/SilentVoid13/Templater)
* [Modal Form](https://github.com/danielo515/obsidian-modal-form/)
* [Varinote](https://github.com/gsarig/obsidian-varinote)
