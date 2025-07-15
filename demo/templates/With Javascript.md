---
tags:
  - nothing
$.aliases:
  - nth
  - dm
$.properties:
  - "[[Template 2]]"
$.path: folder/Hello World
---
Content to copy

```js{pochoir}
// Insert properties programmatically
template.properties.$insertTo("tags", "inbox");
template.properties.level = 1
```

```js{pochoir}
// Rewrite file path
template.path.name = "Hello World";
template.path.parent = "folder";
```

```js{pochoir}
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

```js{pochoir disabled}
// Import obsidian interfaces
const obsidian = await template.import("pochoir:obsidian");
const app = await template.import("pochoir:obsidian:app");
console.log(obsidian, app);
```

```js{pochoir disabled}
// Create form programmatically
const { create } = await template.import("pochoir:form");
const form = create();
form.text("title").label("Title").defaultValue("Untitled");
form.textarea("content").label("Content");
form.number("age").label("Age");
form.slider("rank").label("Rank");
form.date("birthday").label("Birthday");
template.exports.form = await form.prompt();
```

```form{pochoir exports=form1}
title:
	type: text
	description: Some desc
	defaultValue: Untitled
count:
	type: number
	defaultValue: 3
remember: 
	type: toggle
pronom:
	type: dropdown
	options:
		she: She
		he: He
		they: They
birthday:
	type: date
	label: Birthday
	defaultValue: 01-01-2025
level:
	type: slider
	label: Level
```

```yml
# Form
{{for key, value of form1}}
{{key}}: {{value}}
{{/for}}
```

End of content

{{ include "[[Template 2]]" }}