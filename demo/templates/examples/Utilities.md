---
tags:
- template
---
```pochoir-js
const app = await template.import("pochoir:app");
const { MarkdownView } = await template.import("pochoir:obsidian");

Object.assign(template.exports, {
	clipboard() {
		return globalThis.navigator.clipboard.readText();
	},
	clipboardURL() {
		return globalThis
			.navigator.clipboard.readText()
			.then((text) => {
				try {
					new URL(text)
					return text;
				} catch (_) {
					return "";
				}
			})
	},
	selection() {
		return app.workspace
                .getActiveViewOfType(MarkdownView)
                ?.editor.getSelection() ?? "";
	}
})
```
