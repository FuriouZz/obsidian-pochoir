import type { Extension } from "src/core/Extension";

export default function extensionProvider(): Extension {
	return (pochoir) => {
		pochoir.providers.push(({ provide }) => {
			provide("extension", {
				enumerable: true,
				configurable: false,
				writable: false,
				value: (extension: Extension) => {
					pochoir.use(extension);
				},
			});
		});
	};
}
