---
hide_menu: false
title: Module
---
# Form module

For more advanced use case, you may be interested to import the `pochoir:form` module inside a Javascript code block.

Using `pochoir:form` module gives the advantages to:
- Use a form previously created with a `pochoir-form` code block
- Create a form programatically

In this example, a form is created with a `pochoir-form` and the modal is prompt programatically in javascript.

````md
```pochoir-form name="my-form"
title:
  type: text
  label: Title
desc:
  type: textarea
  label: Description
```

```pochoir-js
const { prompt } = await template.import("pochoir:form");
template.exports.myForm = await prompt("my-form");
```
````

You can also recreate the same example entirely in Javascript:

````md
```pochoir-js
const { create, prompt } = await template.import("pochoir:form");
const form = create();
form.text("title").label("Title");
form.textarea("desc").label("Description");
template.exports.myForm = await prompt(form);
```
````

