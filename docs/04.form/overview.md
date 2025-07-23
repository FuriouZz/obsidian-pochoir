---
hide_menu: false
order: 0
title: Overview
---
# Form overview

The `form` code block enables you:
- to describe a form
- prompt a modal
- and use the result in your template

Let's take an example with the code below:
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

In this template, we have:
- a `pochoir-form` code block with the `exports` attribute exposing form results to the variable `myForm`
- a text field `title` and a textarea field `desc`
- and two variables `myForm.title` and `myForm.description` used in our template

<video src="/assets/demo-form.mp4" autoplay controls loop style="width: 100%"></video>

Learn more about [form attributes](/form/attributes/) and [form fields](/form/fields/).
