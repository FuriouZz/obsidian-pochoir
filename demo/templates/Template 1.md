---
tags:
  - template
aliases:
  - t1
  - tpl
---
```js {pochoir}
pochoir.$properties.insertTo("tags", "test");
await pochoir.include("[[Template 2]]");
await pochoir.include("[[Functions]]");
exports.addCreated();
```

```yml {pochoir}
title: Template 1
number: 1
boolean: true
date: {{date.today()}}
tags:
- inbox
```

```js {pochoir}
exports.message = "Hello World";
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
exports.form = await form.prompt();
```

{{message}}

{{properties.title}}

{{for tag of properties.tags}}
{{tag}}
{{/for}}

{{date.today()}}

{{ include "[[Template 2]]" }}

{{ for key, value of form }}
{{key}}: {{value}}{{/for}}