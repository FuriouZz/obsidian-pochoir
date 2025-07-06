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

```js {pochoir}
const form = pochoir.form.create();

form.text("title").label("Title").desc("Some desc");
form.number("count").label("Count");
form.textarea("content").label("Content");
form.toggle("remember").label("Remember");
form.dropdown("pronoms").label("Pronoms")
	.option("she", "She")
	.option("he", "He")
	.option("they", "They");
form.date("birthday").label("Birthday");
form.slider("Level");

// template.exports.form = await form.prompt();
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
