---
hide_menu: false
title: Attributes
---
# Form Attributes

To create a form, you need to create a `yaml` code block with these attributes:

|name|value|required|description|
|-|-|-|-|
|`pochoir`|*empty*| ✅ |Indicates the plugin to evaluate this code block|
|`type`|"form"|✅|Indicates a form description|
|`name`|*string*|❌|Useful if want to access the form from a Javascript code block|
|`exports`|*string*|❌|Will trigger the form modal and exports the results to the given variable name|

## Examples

### Describe a form and access it from Javascript

````md
```yaml {pochoir type="form" name="form"}
title:
  type: text
  label: Title
```

```js {pochoir}
const { getForm } = await template.import("pochoir:form");
const form = getForm("form");
console.log(form.fields);
template.exports.data = await form.prompt();
```

# {{data.title}}
````
