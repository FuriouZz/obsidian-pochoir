---
hide_menu: false
title: Properties
---
# Properties

It can be inconvenient to see your templates appear in your [Dataview query](https://blacksmithgu.github.io/obsidian-dataview/) or [Bases](https://help.obsidian.md/bases).

For example, you have a template with a tag `inbox`, but you do not want it to appear in your Base.

**Pochoir** offers `pochoir-props` (or `pochoir-properties`) code block to set properties for your future note.

**You need to enable `pochoir-props` code block in plugin settings.**

> [!note]
> [Special properties](/special-properties/), variables and functions also works in `pochoir-props`.

## Attributes

### disabled

Disable the code block

### noclear

`pochoir-props` clears all registered properties by default. You can disable this behavior with `noclear` attribute.

## Example

### Basic usage

````md
---
tags:
- template
---

```pochoir-props
tags:
- inbox
```
````

Outputs:
````md
---
tags:
- inbox
---
````

### noclear attribute

````md
---
tags:
- template
---

```pochoir-props noclear
tags:
- inbox
```
````

Outputs:
````md
---
tags:
- template
- inbox
---
````

