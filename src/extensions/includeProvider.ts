import type { Extension } from "src/core/Extension";
import { findLinkPath } from "src/core/utils";

export default function includeProvider(): Extension {
	return (pochoir) => {
		pochoir.providers.push(({ provide }) => {
			provide("include", {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (path: string) => {
					const file = findLinkPath(pochoir.plugin.app, path);
					if (!file) throw new Error(`Cannot find ${path}`);
					return pochoir.renderTemplate(file);
				},
			});
		});
	};
}
