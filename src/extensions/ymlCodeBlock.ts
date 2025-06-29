import type { Extension } from "src/core/Extension";
import PropertiesBuilder from "src/core/PropertiesBuilder";

export default function ymlCodeBlock(): Extension {
	return (pochoir) => {
		pochoir.codeBlocks.push({
			languages: ["yml", "yaml"],
			async evaluate(codeBlock, context) {
				const result = await pochoir.templateEngine.render(
					codeBlock.code,
					context,
				);
				const $properties = Reflect.get(context, "$properties");
				if ($properties instanceof PropertiesBuilder) {
					$properties.fromYaml(result);
				}
			},
		});
	};
}
