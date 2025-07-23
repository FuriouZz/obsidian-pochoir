```pochoir-js
// Create form programmatically
const { createForm } = await template.import("pochoir:form");
const form = createForm();

form.title("Identity");
form.text("title").label("Title").desc("Some desc").defaultValue("Untitled");
form.number("age").label("Age").defaultValue(34);
form.toggle("remember").label("Remember");
form.textarea("content").label("Content");
form.dropdown("pronom").label("Pronom")
	.option("she", "She")
	.option("he", "He")
	.option("they", "They");
form.date("birthday").label("Birthday").defaultValue("2005-01-01");
form.slider("level").label("Level");

template.exports.form = await form.prompt();
```

```yaml
# Form
{{for key, value of form}}
{{key}}: {{value}}
{{/for}}
```