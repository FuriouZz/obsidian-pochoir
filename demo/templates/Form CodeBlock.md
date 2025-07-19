```pochoir-form {exports="form" name="form"}
title:
	type: text
	description: Some desc
	defaultValue: Untitled
age:
	type: number
	defaultValue: 34
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

```pochoir-js
// Create form programmatically
const { getForm, getForms } = await template.import("pochoir:form");
const form = getForm("form");
console.log(form.result, getForms());
```

```yaml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```
