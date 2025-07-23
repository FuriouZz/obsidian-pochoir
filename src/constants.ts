import type { ActivableExtensionList, ISettings } from "./setting-tab";

export const DEFAULT_SETTINGS: ISettings = {
    templates_folder: "templates",
    extensions: ["special-properties"],
};

export const EXTENSION_SETTINGS: ActivableExtensionList = [
    [
        "special-properties",
        {
            label: "Enable special properties",
            desc() {
                const fragment = new DocumentFragment();
                const div = fragment.createDiv();
                div.innerHTML = `
                Use powerful properties to improve your template.<br/>
                See <a href="https://furiouzz.github.io/obsidian-pochoir/special-properties/overview/">
                    Special properties
                </a> documentation.
                `;
                return fragment;
            },
        },
    ],
    [
        "command",
        {
            label: "Enable command",
            desc() {
                const fragment = new DocumentFragment();
                const div = fragment.createDiv();
                div.innerHTML = `
                Trigger template from command palette or ribbon action <br/>
                See <a href="https://furiouzz.github.io/obsidian-pochoir/command/overview/">Command</a> documentation
                `;
                return fragment;
            },
        },
    ],
    [
        "form",
        {
            label: "Enable form",
            desc() {
                const fragment = new DocumentFragment();
                const div = fragment.createDiv();
                div.innerHTML = `
                Fill your template from a modal form <br />
                See <a href="https://furiouzz.github.io/obsidian-pochoir/form/overview/">Form</a> documentation
                `;
                return fragment;
            },
        },
    ],
    [
        "javascript",
        {
            label: "Enable javascript",
            desc() {
                const fragment = new DocumentFragment();
                const div = fragment.createDiv();
                div.innerHTML = `
                Use Javascript for more complex template or expose new functions <br />
                See <a href="https://furiouzz.github.io/obsidian-pochoir/javascript/overview/">Javascript</a> documentation
                `;
                return fragment;
            },
        },
    ],
];
