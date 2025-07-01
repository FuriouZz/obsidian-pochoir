import { moment } from "obsidian";
import type { Extension } from "../environment";

export default function (): Extension {
	return (env) => {
		env.variables.push((context) => {
			const date = {
				today(format = "YYYY-MM-DD") {
					return moment().format(format);
				},
			};
			context.globals.date = date;
			context.exports.date = date;
		});
	};
}
