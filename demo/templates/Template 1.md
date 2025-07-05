---
title: Template 1
number: 1
boolean: true
date: "{{date.today()}}"
tags:
- inbox
- test
---
```js {pochoir}
const tpl2 = await pochoir.import("[[Template 2]]");
template.$properties.fromObject(tpl2.properties);

const fn = await pochoir.import("[[Functions]]");
fn.addCreated(template.properties);
```

```js {pochoir}
template.exports.message = "Hello World";
```

```js {pochoir}
template.exports.form = await pochoir.form.open((form) => {
	form.text("title").label("Title").desc("Some desc");
	form.number("count").label("Count");
	form.textarea("content").label("Content");
	form.toggle("remember").label("Remember");
	form.dropdown("pronoms").label("Pronoms")
	    .option("she", "She")
	    .option("he", "He")
	    .option("they", "They");
	form.date("birthday").label("Birthday");
	form.slider("Level")	
});
```

exports.message = {{message}}

properties.title = {{properties.title}}

Tags: 
{{for tag of properties.tags}}
- {{tag}}
{{/for}}

Today: {{date.today()}}

{{ include "[[Template 2]]" }}

Form:
{{ for key, value of form }}
{{key}}: {{value}}{{/for}}