import type { Environment, Extension } from "../environment";
import { PochoirError } from "../errors";
import type { Template } from "../template";
import { alertError } from "../utils/alert";
import { parseYaml } from "../utils/obsidian";
import { createCodeBlockProcessorTests as test } from "../utils/processor";

export interface Command {
    id: string;
    icon: string;
    title: string;
    action: "create" | "insert";
}

export class CommandManager {
    env: Environment;
    map = new Map<string, string>();

    constructor(env: Environment) {
        this.env = env;
    }

    addRibon(template: Template, command: Command) {
        this.env.plugin.addRibbonIcon(command.icon, command.title, async () => {
            if (command.action === "insert") {
                await this.env.insertFromTemplate(template);
            } else {
                await this.env.createFromTemplate(template);
            }
        });
        this.map.set(command.title, template.info.file.path);
    }

    removeRibon(title: string) {
        const id = `${this.env.plugin.manifest.id}:${title}`;
        const { leftRibbon } = this.env.plugin.app.workspace;
        const item = leftRibbon.items.find((item) => item.id === id);
        if (item) {
            item.buttonEl?.detach();
            leftRibbon.removeRibbonAction(item.id);
            leftRibbon.items.remove(item);
        }
    }

    addCommand(template: Template, command: Command) {
        this.env.plugin.addCommand({
            id: command.id,
            name: command.title,
            callback: async () => {
                if (command.action === "insert") {
                    await this.env.insertFromTemplate(template);
                } else {
                    await this.env.createFromTemplate(template);
                }
            },
        });
        this.map.set(command.id, template.info.file.path);
    }

    removeCommand(id: string) {
        this.env.plugin.removeCommand(id);
    }

    deleteAllFromPath(path: string) {
        const entries = [...this.map.entries()].filter(
            ([_, value]) => path === value,
        );
        if (entries.length === 0) return;
        for (const [id] of entries) {
            this.removeRibon(id);
            this.removeCommand(id);
            this.map.delete(id);
        }
    }

    clear() {
        for (const [_, path] of this.map.entries()) {
            this.deleteAllFromPath(path);
        }
    }
}

export default function (): Extension {
    return (env) => {
        const ribbon = new CommandManager(env);

        env.plugin.app.metadataCache.on("deleted", (file) => {
            ribbon.deleteAllFromPath(file.path);
        });

        env.preprocessors.set("codeblock:ribbon", {
            type: "codeblock",
            test: test([
                ["yaml", { type: "ribbon" }],
                ["yaml", { type: "command" }],
            ]),
            async process({ codeBlock, template }) {
                ribbon.deleteAllFromPath(template.info.file.path);

                const command = {
                    title: template.info.file.basename,
                    icon: "shield-question-mark",
                    action: "create",
                    ...parseYaml<Partial<Command> & { id: string }>(
                        codeBlock.code,
                    ),
                } as Command;

                if (typeof command.id !== "string") {
                    alertError(new PochoirError("id is missing"));
                    return;
                }

                if (codeBlock.attributes.type === "command") {
                    ribbon.addCommand(template, command);
                } else {
                    ribbon.addRibon(template, command);
                }
            },
            disable({ template }) {
                ribbon.deleteAllFromPath(template.info.file.path);
            },
            dispose() {
                ribbon.clear();
            },
        });
    };
}
