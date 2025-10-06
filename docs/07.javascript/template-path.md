---
order: 1
title: Path
---
# Path

Use `template.path` to read/write note path:

{{ import { today } from "../_includes/functions.vto" }}

This code block will create a template at path `{{today("YYYYMMDDHHmm")}}.md`:

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.path.basename = today("YYYYMMDDHHmm");
```
````

Alternatively, you can use [$.path](/special-properties/path) property.

## Full example

```js
// Set file name (without extension)
template.path.basename = "Daily";

// Set file extension
template.path.extension = "md";

// Set file name (with extension)
template.path.name = "Daily.md";

// Set folder name
template.path.parent = "dailies";

// Set full path
template.path.path = "dailies/Daily.md";
```

## Example

### Create unique note

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.path.basename = today("YYYYMMDDHHmm");
template.path.parent = "inbox";
template.$properties.insertTo("tags", "inbox");
template.properties.date = today("YYYY-MM-DD");
```
````

Outputs a note at `inbox/{{ today('YYYYMMDDHHmm') }}.md`:

````md {filename="inbox/{{ today('YYYYMMDDHHmm') }}.md"}
---
date: {{today('YYYY-MM-DD')}}
tags:
- inbox
---
````
