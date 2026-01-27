{{ if title }}{{title}}
{{ /if }}

```pochoir-command
title: Add new entry
icon: file-pen
action: insert
triggers:
- command
```

```pochoir-js
const content = await template.import("pochoir:content");
const { today } = await template.import("pochoir:date");

const title = `## ${today("YYYY-MM-DD")}`
template.exports.title = title;

content.getTargetContent(({content}) => {
	let result = content.transformByLine((line, index) => {
		if (line.startsWith("## ") && line === title) {
			template.exports.title = "";
		}
		return line;
	});
	if (template.exports.form.content) {
		result += `- ${template.exports.form.content}{^}\n`;
	} else {
		result += `- {^}\n`;
	}
	content.update(result);
});
```

```pochoir-form exports=form
content:
	label: Content
	type: text
```