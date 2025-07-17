import type { Environment, Extension } from "environment";
import type { Template } from "template";
import { parseYaml } from "utils/obsidian";
import { createCodeBlockProcessorTest as test } from "utils/processor";

export interface RibbonCommand {
    icon: string;
    title: string;
    action: "create" | "insert";
}

export const DefaultRibbonCommand: RibbonCommand = {
    title: "Noname",
    icon: "shield-question-mark",
    action: "create",
};

export class RibbonManager {
    env: Environment;
    map = new Map<string, string>();

    constructor(env: Environment) {
        this.env = env;
    }

    add(template: Template, command: RibbonCommand) {
        this.env.plugin.addRibbonIcon(command.icon, command.title, async () => {
            if (command.action === "insert") {
                await this.env.insertFromTemplate(template);
            } else {
                await this.env.createFromTemplate(template);
            }
        });
        this.map.set(command.title, template.info.file.path);
    }

    deleteAllFromPath(path: string) {
        const entries = [...this.map.entries()].filter(
            ([_, value]) => path === value,
        );
        if (entries.length === 0) return;
        for (const [title] of entries) {
            this.remove(title);
            this.map.delete(title);
        }
    }

    remove(title: string) {
        const id = `${this.env.plugin.manifest.id}:${title}`;
        const { leftRibbon } = this.env.plugin.app.workspace;
        const item = leftRibbon.items.find((item) => item.id === id);
        if (item) {
            item.buttonEl.detach();
            leftRibbon.removeRibbonAction(item.id);
            leftRibbon.items.remove(item);
        }
    }
}

export default function (): Extension {
    return (env) => {
        const ribbon = new RibbonManager(env);

        env.plugin.app.metadataCache.on("deleted", (file) => {
            ribbon.deleteAllFromPath(file.path);
        });

        env.preprocessors.set("codeblock:ribbon", {
            type: "codeblock",
            test: test("yaml", { type: "ribbon" }),
            async process({ codeBlock, template }) {
                ribbon.deleteAllFromPath(template.info.file.path);

                const command = {
                    ...DefaultRibbonCommand,
                    title: template.info.file.basename,
                    ...parseYaml<Partial<RibbonCommand>>(codeBlock.code),
                };

                ribbon.add(template, command);
            },
            disable({ template }) {
                ribbon.deleteAllFromPath(template.info.file.path);
            },
        });
    };
}
