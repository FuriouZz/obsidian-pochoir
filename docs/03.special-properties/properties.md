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

I have the template `[[JohnTemplate]]` with the content below:

```md
---
tags:
- toreview
author: John Doe
year: {{today('YYYY')}}
---
```

I can inherits `[[JohnTemplate]]` with `$.properties`:

```md
---
tags:
- book
$.properties:
- "[[JohnTemplate]]"
---
```

The results will be:

```md
---
title: My Book
author: John Doe
year: {{today('YYYY')}}
tags:
- book
- toreview
---
```

