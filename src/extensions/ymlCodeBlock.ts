import type { Extension } from "src/core/Extension";

export default function ymlCodeBlock(): Extension {
	return ({ codeBlockProcessors, templateEngine }) => {
		const langRegex = /ya?ml/;
		codeBlockProcessors.push(async ({ codeBlock, template }) => {
			if (!langRegex.test(codeBlock.language)) return false;
			const context = template.context;
			const result = await templateEngine.renderString(
				codeBlock.code,
				context.exports,
			);
			context.globals.$properties.fromYaml(result);
			return true;
		});
	};
}
