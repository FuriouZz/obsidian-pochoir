import { findLinkPath } from "src/utils";
import type { Extension } from "../environment";

export default function includeProvider(): Extension {
	return (env) => {
		env.variables.push((context) => {
			const include = async (path: string) => {
				const file = findLinkPath(env.plugin.app, path);
				if (!file) throw new Error(`Cannot find ${path}`);

				const template = await env.parseTemplate(file, context);
				await template.evaluateCodeBlocks(env.codeBlockProcessor);

				return template;
			};

			context.globals.include = include;
		});
	};
}
