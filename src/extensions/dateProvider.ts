import { moment } from "obsidian";
import type { Extension } from "src/core/Extension";

export default function dateProvider(): Extension {
	return (pochoir) => {
		pochoir.providers.push(({ provide }) => {
			provide("today", {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (format = "YYYY-MM-DD") => {
					return moment().format(format);
				},
			});
		});
	};
}
