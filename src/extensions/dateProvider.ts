import { moment } from "obsidian";
import type { Extension } from "src/core/Extension";

export default function dateProvider(): Extension {
	return ({ contextProviders }) => {
		const date = {
			today(format = "YYYY-MM-DD") {
				return moment().format(format);
			},
		};

		contextProviders.push((context) => {
			context.globals.date = date;
			context.exports.date = date;
		});
	};
}
