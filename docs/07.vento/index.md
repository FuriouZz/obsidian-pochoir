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

For example, in `[[Template 1]]`:

```vento
{{ export message }}
Hello World
{{ /export }}

{{ export function greeting(name) }}
Hello, {{name}}!
{{ /export }}

Some content
```

I can import `[[Template 1]]` variables/functions:

```vento
{{ import { message, greeting } from "[[Template 1]]" }}

{{- message -}}
{{- greeting("John") -}}
```

Outputs:
```md
Hello World
Hello, John!
```

You can also include `[[Template 1]]` content:

```vento
{{ include "[[Template 1]]" }}
```

Outputs:
```md
Some content
```

