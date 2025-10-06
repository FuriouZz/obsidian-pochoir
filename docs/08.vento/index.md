---
title: Vento
---
# Vento

[Vento](https://vento.js.org/) is the template engine used for note templating.

Please follow the [documentation](https://vento.js.org/) for more details.

## Custom loader

**Pochoir** implements a custom loader enabling you to:
- Use [include tag](https://vento.js.org/syntax/include/) to insert a template
- Use [import/export tag](https://vento.js.org/syntax/import-export/) to share functions between template

For example, we have this template:

{{echo}}
```vento {filename="Template 1.md" lang="md"}
{{ export message }}
Hello World
{{ /export }}

{{ export function greeting(name) }}
Hello, {{name}}!
{{ /export }}

Some content
```
{{/echo}}

We can import its variables and functions:

{{echo}}
```vento {filename="Template 2.md" lang="md"}
{{ import { message, greeting } from "[[Template 1]]" }}

{{- message -}}
{{- greeting("John") -}}
```
{{/echo}}

Outputs:
```md {filename="Note.md"}
Hello World
Hello, John!
```

We can also include its content:

{{echo}}
```vento {filename="Template 3.md" lang="md"}
{{ include "[[Template 1]]" }}
```
{{/echo}}

Outputs:
```md {filename="Note 2.md"}
Some content
```

