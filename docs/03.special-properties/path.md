---
order: 1
title: Path
templateEngine: [vto, md]
---
{{ import { today } from "../_includes/functions.vto" }}

# Path

Use `$.path` property to rename/move a note.

The property accepts a **text** path representing the final path.

Like the template content, you can use variables in this property.

You can omit the file extension (this is `.md` by default).

> [!warning]
> When a file already exists at the location, the template content will be merged with the existing file.

## Examples

### Create an unique note

{{ echo }}
````md
---
$.path: "inbox/{{date.today('YYYY-MM-DD')}}"
---
````
{{ /echo }}

Create note at `inbox/{{today('YYYY-MM-DD')}}.md`.

### Change file directory

{{ echo }}
````md
---
$.path: "references/bookmark/{{originalPath.basename}}"
---
````
{{ /echo }}

Create note at `references/bookmark/NOTE_BASENAME.md`.

### Append date

{{ echo }}
````md
---
$.path: "{{originalPath.parent}}/{{date.today('YYYY-MM-DD')}} {{originalPath.basename}}"
---
````
{{ /echo }}

Create note at `NOTE_PARENT/{{ today('YYYY-MM-DD') }} NOTE_BASENAME.md`.
