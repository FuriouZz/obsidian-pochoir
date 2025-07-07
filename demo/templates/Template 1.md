---
title: Template 1
number: 1
boolean: true
date: "{{date.today()}}"
tags:
  - inbox
  - test
$.aliases:
  - tpl
  - tpl1
$.extend: "[[Template 2]]"
---
```js {pochoir}
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

```filename {pochoir}
# title: {{[[Template 2]].zid}} {{form.title}}
```

```js {pochoir}
const tpl2 = await pochoir.import("[[Template 2]]");
const fn = await pochoir.import("[[Functions]]");
const form = template.exports.form;
template.file.title = `${tpl2.zid} ${form.title}`
template.file.parent = fn.yolo() + "totoo";
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
