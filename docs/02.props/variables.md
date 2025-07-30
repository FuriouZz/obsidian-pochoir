---
hide_menu: false
title: Variables
---
# Variables

You can use **variables** or **functions** inside your properties.

**Pochoir** provides internals one, but you can provide your owns.

## Internal variables

### date

The `date` object provides functions related to dates.

- `date.moment` returns [moment](https://momentjs.com/) object.
- `date.today(FORMAT=YYYY-MM-DD)` returns today's date with specified format
- `date.time(FORMAT=HH:mm)` returns 
- `date.tomorrow(FORMAT=YYYY-MM-DD)`
- `date.yesterday(FORMAT=YYYY-MM-DD)`

#### Example

Create unique note.

```md
---
date: "{{date.today()}}"
$.path: "inbox/{{date.today('YYYMMDDHHmmss')}}"
---
```

### path and originalPath

Use `path` to get the note file path. If you want the file path before change you can use `originalPath` object.

- `path.path` returns the file path (eg.: `inbox/note.md`).
- `path.parent` returns the parent folder (eg.: `inbox`).
- `path.name` returns the file name with extension (eg.: `note.md`).
- `path.basename` returns the file name without extension (eg.: `note`).
- `path.extension` returns the file extension (eg.: `md`).

#### Example

A snippet to append date to a note file name.

```md
---
$.path: "{{path.parent}}/{{date.today('YYYMMDDHHmm')}} {{path.name}}"
---
```

## Custom variables

You can create your own variable with the [JavaScript API](/javascript/) and use them with [$.imports](/special-properties/imports/) special properties.
