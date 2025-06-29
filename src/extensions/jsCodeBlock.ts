import type { Extension } from "src/core/Extension";
import { createAsyncFunction } from "src/core/utils";

export default function jsCodeBlock(): Extension {
	return (pochoir) => {
		pochoir.codeBlocks.push({
			languages: ["js", "javascript"],
			async evaluate(codeBlock, context) {
				await createAsyncFunction(
					[`const {${Object.keys(context)}} = pochoir;`, codeBlock.code].join(
						"\n",
					),
					"pochoir",
				)(context);
			},
		});
	};
}
