import type { Extension } from "../environment";

export default function ymlCodeBlock(): Extension {
	return (env) => {
		const langRegex = /ya?ml/;
		env.codeBlockProcessor.push(async ({ codeBlock, template }) => {
			if (!langRegex.test(codeBlock.language)) return false;
			const context = template.context;
			const result = await env.templateEngine.renderString(
				codeBlock.code,
				context.exports,
			);
			context.globals.$properties.fromYaml(result);
			return true;
		});
	};
}
