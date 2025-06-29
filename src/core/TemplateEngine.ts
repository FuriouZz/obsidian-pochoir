import { vento } from "./vento";

export class TemplateEngine {
	vento = vento({
		dataVarname: "pochoir",
		autoDataVarname: true,
	});

	async render(content: string, data: unknown) {
		const result = await this.vento.runString(content, data);
		return result.content as string;
	}
}
