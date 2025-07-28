---
order: 2
title: Properties
templateEngine: [vto, md]
---
{{ import { today } from "../_includes/functions.vto" }}

# Properties

Use `$.properties` property to inherits properties from specified list templates.

The property accepts a **list** of templates.

## Inherits properties from another template

Here a template with some properties:

```md {filename="John Template.md"}
---
tags:
- toreview
author: John Doe
year: {{today('YYYY')}}
---
```

I can inherits them by adding `$.properties` to my other template:

```md {filename="Another Template.md"}
---
tags:
- book
$.properties:
- "[[John Template]]"
---
```

The results will be:

```md {filename="Note.md"}
---
title: My Book
author: John Doe
year: {{today('YYYY')}}
tags:
- book
- toreview
---
```

