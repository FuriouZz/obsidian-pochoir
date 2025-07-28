```pochoir-js
// Create form programmatically
const { create, prompt } = await template.import("pochoir:form");
const form = create();

//form.title("Identity");
form.text("title").label("Title").description("Some desc").initialValue("Untitled");
form.number("age").label("Age").initialValue(34);
form.toggle("remember").label("Remember");
form.textarea("content").label("Content");
form.dropdown("pronom").label("Pronom")
    .options({ she: "She", he: "He", they: "They" });
form.date("birthday").label("Birthday").initialValue("2005-01-01");
form.slider("level").label("Level");

template.exports.form = await prompt(form);
```

```yaml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```