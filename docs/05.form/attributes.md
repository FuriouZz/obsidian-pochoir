---
hide_menu: false
title: Attributes
---
# Form attributes

To create a form, you need to create a `pochoir-form` code block.

## Attributes

> [!tip]
> You can write attributes with or without double quote

### disabled

Disable the form

### name

Useful if want to get the form in javascript

### exports

Trigger a form modal and exports the results in the given variable name

## Examples

### Describe a form and prompt the modal

````md
```pochoir-form exports="myForm"
title:
  type: text
  label: Title
```

# {{myForm.title}}
````

### Describe a form and access it from Javascript

````md
```pochoir-form name="my-form"
title:
  type: text
  label: Title
```

```pochoir-js
const form = await template.import("pochoir:form");
const myForm = form.get("my-form");
console.log(myForm.toJSON()); // Print a field list to the console
template.exports.myForm = await form.prompt(myForm);
```

# {{myForm.title}}
````
