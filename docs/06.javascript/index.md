---
hide_menu: false
title: JavaScript
---
# JavaScript

The `pochoir-js` code block allows you to execute Javascript code.

**You need to enable `pochoir-js` code block in plugin settings.**

> [!warning]
> It can be dangerous to execute Javascript code. We recommand to use code that you understand.

Most features offered by in Javascript code can be done with [Special properties](/special-properties/overview).

The main use cases of this code block are:
- Expose your own variables and functions
- Create a form programatically with dynamic default values
- Change file path programmatically
- Share code between templates

## Attributes

The code block only accept the `disabled` attribute to ignore it.

````md
```pochoir-js disabled
// This code will be not executed
alert("Hello World");
```
````

## The `template` variable

Inside a `pochoir-js` code block, you have access to a `template` variable.

This variable is your template's context. Each template has its own context.

This context enables to interact with the plugin and other templates.

Let's take an example. If you want to expose a variable to my template I can use `template.exports` object.

Let's create a variable `{{message}}` and use it:

````md
```pochoir-js
template.exports.message = "Hello World";
```
{{ message }}
````

Now, if we want to use `{{message}}` into another template, we will use `template.import()` function.

Our previous template is called `[[Functions]]`, and now we will import it into our new template:

````md
```pochoir-js
const { message } = await template.import("[[Functions]]");
template.exports.message = message;
```
{{ message }}
````

