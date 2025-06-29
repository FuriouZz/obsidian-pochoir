import { MarkdownView } from "obsidian";
import type { Extension } from "src/core/Extension";
import PropertiesBuilder from "src/core/PropertiesBuilder";

export default function propertiesProvider(): Extension {
	return (pochoir) => {
		pochoir.providers.push(({ provide }) => {
			const $properties = new PropertiesBuilder();
			const properties = $properties.createProxy();
			provide("properties", {
				enumerable: true,
				configurable: false,
				writable: false,
				value: properties,
			});
			provide("$properties", {
				enumerable: true,
				configurable: false,
				writable: false,
				value: $properties,
			});
		});

		pochoir.on("template:rendered", ({ pochoir, context }) => {
			const workspace = pochoir.plugin.app.workspace;
			const $properties = Reflect.get(context, "$properties");
			if ($properties instanceof PropertiesBuilder) {
				const view = workspace.getActiveViewOfType(MarkdownView);
				view?.metadataEditor?.insertProperties($properties.toObject());
			}
		});
	};
}
