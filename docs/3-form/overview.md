---
hide_menu: false
order: 0
title: Overview
---
# Form Code Block

The `form` code block enables you:
- to describe a form
- prompt a modal
- and use the result in your template

Let's take an example with the code below:
````md
```yaml {pochoir type=form exports=data}
title:
  type: text
  label: Title
  defaultValue: Untitled
desc:
  type: textarea
  label: Description
```

# {{data.title}}

{{data.desc}}
````

In this template, we have:
- A `yaml` code block with these attributes:
  - `poichoir` indicating the plugin to evaluate this code block
  - `type=form` indicating a form description
  - `exports=data` exposing form results to the variable `data`
- Two inputs are declared in `yaml`:
  - the text field `title`
  - the textarea field `description`
- Variables `data.title` and `data.description` are used in our template and it will be rendered in our note

<video src="/assets/demo-form.mp4" autoplay controls loop style="width: 100%"></video>

Learn more about [form attributes](/form-code-block/form-attributes/) and [form fields](/form-code-block/form-fields/).
