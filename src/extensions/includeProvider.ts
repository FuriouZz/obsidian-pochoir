import type { Extension } from "src/core/Extension";
import { findLinkPath } from "src/core/utils";

export default function includeProvider(): Extension {
	return (pochoir) => {
		const { contextProviders, plugin, codeBlockProcessors } = pochoir;
		contextProviders.push((context) => {
			const include = async (path: string) => {
				const file = findLinkPath(plugin.app, path);
				if (!file) throw new Error(`Cannot find ${path}`);

				const template = await pochoir.parseTemplate(file, context);
				await template.evaluateCodeBlocks(codeBlockProcessors);

				return template;
			};

			context.globals.include = include;
		});
	};
}
