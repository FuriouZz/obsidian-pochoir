import * as obsidian from "obsidian";
import type { Extension } from "../environment";

export default function (): Extension {
	return (env) => {
		env.variables.push((context) => {
			context.globals.app = env.plugin.app;
			context.globals.obsidian = obsidian;
		});
	};
}
