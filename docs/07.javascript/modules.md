---
order: 2
title: Modules
---
# Modules

**Pochoir** provides internal modules that you can use with `template.import()` function.

## Date module

The `pochoir:date` module expose [moment()](https://momentjs.com/) function and `today(format?)` function.

Example:

````md
```pochoir-js
const { today } = await template.import("pochoir:date");
template.exports.today = today("YYYY-MM-DD");
```
````

## Form module

See [Form Modume API](/form/module) to see how to use `pochoir:form`.
