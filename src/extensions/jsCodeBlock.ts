import { createAsyncFunction } from "src/utils";
import type { Extension } from "../environment";

export default function jsCodeBlock(): Extension {
	return (env) => {
		const langRegex = /js|javascript/;
		env.codeBlockProcessor.push(async ({ codeBlock, template }) => {
			if (!langRegex.test(codeBlock.language)) return false;
			const context = template.context;
			const fn = createAsyncFunction(codeBlock.code, "pochoir", "exports");
			await fn(context.globals, context.exports);
			return true;
		});
	};
}
