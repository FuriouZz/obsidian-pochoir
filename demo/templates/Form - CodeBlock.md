```pochoir-form exports="form"
title:
	type: text
	description: Some desc
	defaultValue: Untitled
	required: true
age:
	type: number
	defaultValue: 34
	required: true
remember: 
	type: toggle
pronom:
	type: dropdown
	options:
		she: She
		he: He
		they: They
	required: true
birthday:
	type: date
	label: Birthday
	defaultValue: 2025-01-01
level:
	type: slider
	label: Level
```

```yaml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```
