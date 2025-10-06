---
hide_menu: false
title: Form
---
# Form

The `form` code block enables you:
- to describe a form
- prompt a modal
- and use the result in your template

**You need to enable `pochoir-form` code block in plugin settings.**

{{ comp flex }}
    {{ comp video { src: "/assets/demo-form.mp4" } /}}
{{ /comp }}

Let's take an example with the code below:

{{ echo }}
````md
```pochoir-form exports="myForm"
title:
  type: text
  label: Title
  defaultValue: Untitled
desc:
  type: textarea
  label: Description
```

# {{myForm.title}}

{{myForm.desc}}
````
{{ /echo }}

In this template, we have:
- a `pochoir-form` code block with the `exports` attribute exposing form results to the variable `myForm`
- a text field `title` and a textarea field `desc`
- and two variables `myForm.title` and `myForm.description` used in our template

Learn more about [form attributes](/form/attributes/) and [form fields](/form/fields/).
