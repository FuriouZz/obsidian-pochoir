---
title: Template 1
number: 1
boolean: true
date: "{{date.today()}}"
tags:
  - inbox
pochoir.aliases:
  - tpl
  - tpl1
---
```js {pochoir}
template.properties.$insertTo("tags", "test");

const tpl2 = await pochoir.import("[[Template 2]]");
template.properties.$fromObject(tpl2.properties);

const fn = await pochoir.import("[[Functions]]");
fn.addCreated(template.properties);
```

```js {pochoir}
template.exports.message = "Hello World";
```

```form {pochoir exports=form}
title:
	type: text
	label: Title
	description: Some desc
	defaultValue: Untitled
count:
	type: number
	label: Count
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
level:
	type: slider
	label: Level
```

exports.message = {{message}}

properties.title = {{properties.title}}

Properties:

```yaml
{{for key, value of properties}}
{{key}}: {{value}}
{{/for}}
```

Tags:
```yaml
tags:
{{for tag of properties.tags}}
- {{tag}}
{{/for}}
```

Today: {{date.today()}}

{{ include "[[Template 2]]" }}

Form:
```yaml
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```
