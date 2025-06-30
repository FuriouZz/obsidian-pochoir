import type { Extension } from "src/core/Extension";
import { createAsyncFunction } from "src/core/utils";

export default function jsCodeBlock(): Extension {
	return ({ codeBlockProcessors }) => {
		const langRegex = /js|javascript/;
		codeBlockProcessors.push(async ({ codeBlock, template }) => {
			if (!langRegex.test(codeBlock.language)) return false;
			const context = template.context;
			await createAsyncFunction(
				codeBlock.code,
				"pochoir",
				"exports",
			)(context.globals, context.exports);
			return true;
		});
	};
}
