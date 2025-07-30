import { toSlug } from "@furiouzz/lol/string/string";
import type { Environment, Extension } from "../environment";
import type { Template } from "../template";
import { alertWrap } from "../utils/alert";
import { parseYaml } from "../utils/obsidian";

export default function (): Extension {
    return {
        name: "command",
        settings: {
            label: "Enable [pochoir-command](https://furiouzz.github.io/obsidian-pochoir/command/overview/) code block",
            desc: "Trigger template from command palette or ribbon action",
        },
        setup(env) {
            const cmd = new CommandManager(env);

            env.plugin.app.metadataCache.on("deleted", (file) => {
                cmd.deleteAllFromPath(file.path);
            });

            env.preprocessors.set("codeblock:command", {
                type: "codeblock",
                languages: { "pochoir-command": "yaml" },
                async process({ codeBlock, template }) {
                    cmd.deleteAllFromPath(template.info.file.path);

                    const json = parseYaml<
                        Partial<
                            Omit<Command, "triggers"> & {
                                trigger: CommandTrigger | CommandTrigger[];
                                triggers: CommandTrigger | CommandTrigger[];
                            }
                        >
                    >(codeBlock.code);

                    const triggers: CommandTrigger[] = [];
                    if (json?.trigger) triggers.push(...[json.trigger].flat());
                    if (json?.triggers)
                        triggers.push(...[json.triggers].flat());
                    if (triggers.length === 0) triggers.push("command");

                    const command: Command = {
                        id:
                            json?.id ??
                            toSlug(json?.title ?? template.info.file.basename),
                        title: template.info.file.basename,
                        icon: "file-question-mark",
                        action: "create",
                        ...json,
                        triggers,
                    };

                    alertWrap(() => cmd.add(template, command));
                },
                disable({ template }) {
                    cmd.deleteAllFromPath(template.info.file.path);
                },
                dispose() {
                    cmd.clear();
                },
            });
        },
    };
}

export type CommandTrigger = "ribbon" | "command";

export interface Command {
    id: string;
    icon: string;
    title: string;
    action: "create" | "insert";
    triggers: CommandTrigger[];
}

export class CommandManager {
    env: Environment;
    map = new Map<string, string>();

    constructor(env: Environment) {
        this.env = env;
    }

    add(template: Template, command: Command) {
        const triggers = command.triggers;
        if (triggers.includes("ribbon")) {
            this.addRibon(template, command);
        }
        if (triggers.includes("command")) {
            this.addCommand(template, command);
        }
    }

    addRibon(template: Template, command: Command) {
        const callback = async () => {
            if (command.action === "insert") {
                await this.env.insertFromTemplate(template);
            } else {
                await this.env.createFromTemplate(template);
            }
        };

        this.env.plugin.addRibbonIcon(command.icon, command.title, callback);
        const { leftRibbon } = this.env.plugin.app.workspace;
        const item = leftRibbon.items.find(
            (item) =>
                item.title === command.title &&
                item.icon === command.icon &&
                item.callback === callback,
        );
        if (item) {
            this.map.set(item.id, template.info.file.path);
        }
    }

    removeRibon(id: string) {
        const { leftRibbon } = this.env.plugin.app.workspace;
        const item = leftRibbon.items.find((item) => item.id === id);
        if (item) {
            item.buttonEl?.detach();
            leftRibbon.removeRibbonAction(item.id);
            leftRibbon.items.remove(item);
        }
    }

    addCommand(template: Template, { id, title: name, action }: Command) {
        this.env.plugin.addCommand({
            id,
            name,
            callback: async () => {
                if (action === "insert") {
                    await this.env.insertFromTemplate(template);
                } else {
                    await this.env.createFromTemplate(template);
                }
            },
        });
        this.map.set(id, template.info.file.path);
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
