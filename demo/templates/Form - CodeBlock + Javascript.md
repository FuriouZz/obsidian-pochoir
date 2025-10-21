```pochoir-form name="form"
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
const { prompt } = await template.import("pochoir:form");
template.exports.form = await prompt("form");
template.abort()
```

```yaml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```
