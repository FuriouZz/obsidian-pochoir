---
tags:
  - javascript
$.aliases:
  - js
$.properties:
  - "[[Inherit Properties]]"
$.path: outputs/Javascript Output
---
Content to copy

```js {pochoir}
// Insert properties programmatically
template.properties.$insertTo("tags", "inbox");
template.properties.level = 1
```

```js {pochoir}
// Rewrite file path
template.path.name = "Hello World";
template.path.parent = "folder";
```

```js {pochoir}
// Import template
const fn = await template.import("[[Functions]]");
template.exports.message = fn.message();
fn.addCreated(template.properties);
```

Message sent {{date.today()}} : {{message}}

```yml
# Properties
{{for key, value of properties}}
{{key}}: {{value}}
{{/for}}
```

```js {pochoir disabled}
// Import obsidian interfaces
const obsidian = await template.import("pochoir:obsidian");
const app = await template.import("pochoir:obsidian:app");
console.log(obsidian, app);
```

```js {pochoir}
// Create form programmatically
const { createForm } = await template.import("pochoir:form");
const form = createForm();
form.text("title").label("Title").defaultValue("Untitled");
form.textarea("content").label("Content");
form.number("age").label("Age");
form.slider("rank").label("Rank");
form.date("birthday").label("Birthday");
template.exports.form = await form.prompt();
```

```yml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```

End of content

{{ include "[[Inherit Properties]]" }}
