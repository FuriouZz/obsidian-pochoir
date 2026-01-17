import { toSlug } from "@furiouzz/lol/string/string";
import type { Menu } from "obsidian";
import type { Environment, Extension } from "../environment";
import { LOGGER } from "../logger";
import type { Template } from "../template";
import { alertWrap } from "../utils/alert";
import { tryParseYaml } from "../utils/obsidian";

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

            env.processors.set("codeblock:command", {
                type: "codeblock",
                languages: { "pochoir-command": "yaml" },
                preprocess({ codeBlock, template }) {
                    cmd.deleteAllFromPath(template.info.file.path);
                    const json = tryParseYaml<
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
                        id: json?.id ?? "",
                        title: template.info.file.basename,
                        icon: "file-question-mark",
                        action: "create",
                        ...json,
                        triggers,
                    };

                    if (!command.id) {
                        command.id = [
                            command.action,
                            command.triggers.join("-"),
                            toSlug(command.title),
                        ].join("-");
                    }

                    alertWrap(() => cmd.add(template, command)).catch(
                        LOGGER.error,
                    );
                },
                disable({ template }) {
                    cmd.deleteAllFromPath(template.info.file.path);
                },
                dispose() {
                    cmd.clear();
                },
                suggestions: [
                    { suggestion: "title: {title}" },
                    { suggestion: "icon: {icon}" },
                    { suggestion: "trigger: ribbon" },
                    { suggestion: "trigger: command" },
                    { suggestion: "trigger: editor-menu" },
                    { suggestion: "action: insert" },
                    { suggestion: "action: create" },
                ],
            });
        },
    };
}

export type CommandTrigger = "ribbon" | "command" | "editor-menu";

export interface Command {
    id: string;
    icon: string;
    title: string;
    action: "create" | "insert";
    triggers: CommandTrigger[];
    template?: string;
    templates?: string[];
}

export class CommandManager {
    env: Environment;
    map = new Map<string, string>();
    menus = new Map<string, (menu: Menu) => void>();

    constructor(env: Environment) {
        this.env = env;
        this.env.plugin.registerEvent(
            this.env.app.workspace.on("editor-menu", (menu) => {
                for (const cb of this.menus.values()) {
                    cb(menu);
                }
            }),
        );
    }

    add(template: Template, command: Command) {
        const triggers = command.triggers;
        if (triggers.includes("ribbon")) {
            this.addRibon(template, command);
        }
        if (triggers.includes("command")) {
            this.addCommand(template, command);
        }
        if (triggers.includes("editor-menu")) {
            this.addEditorMenu(template, command);
        }
    }

    remove(id: string) {
        this.removeRibon(id);
        this.removeCommand(id);
        this.removeEditorMenu(id);
        this.map.delete(id);
    }

    performAction = async (template: Template, command: Command) => {
        const templates: Template[] = [];

        if (command.template) {
            command.templates = [command.template];
        }

        if (command.templates) {
            const all = command.templates.map(async (t) => {
                if (t === "selection()") {
                    return this.env.createVirtualTemplate({
                        type: "selection",
                    });
                } else if (t === "clipboard()") {
                    return this.env.createVirtualTemplate({
                        type: "clipboard",
                    });
                }

                return this.env.cache.resolve(t);
            });
            templates.push(...(await Promise.all(all)).filter((t) => !!t));
        } else {
            templates.push(template);
        }

        if (templates.length > 1) {
            if (command.action === "insert") {
                this.env.plugin.templateSuggester.insertTemplate({ templates });
            } else if (command.action === "create") {
                this.env.plugin.templateSuggester.createFromTemplate({
                    templates,
                });
            }
        } else if (templates.length === 1) {
            if (command.action === "insert") {
                await this.env.insertFromTemplate(templates[0]);
            } else if (command.action === "create") {
                await this.env.createFromTemplate(templates[0]);
            }
        }
    };

    addRibon(template: Template, command: Command) {
        const callback = () => this.performAction(template, command);

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

    addCommand(template: Template, command: Command) {
        const callback = () => this.performAction(template, command);
        this.env.plugin.addCommand({
            id: command.id,
            name: command.title,
            callback,
        });
        this.map.set(command.id, template.info.file.path);
    }

    removeCommand(id: string) {
        this.env.plugin.removeCommand(id);
    }

    addEditorMenu(template: Template, command: Command) {
        const { id, title: name, icon } = command;
        const callback = () => this.performAction(template, command);
        this.menus.set(id, (menu: Menu) => {
            menu.addItem((item) => {
                item.setTitle(name).setIcon(icon).onClick(callback);
            });
        });
        this.map.set(id, template.info.file.path);
    }

    removeEditorMenu(id: string) {
        this.menus.delete(id);
    }

    deleteAllFromPath(path: string) {
        const entries = [...this.map.entries()].filter(
            ([_, value]) => path === value,
        );
        if (entries.length === 0) return;
        for (const [id] of entries) {
            this.remove(id);
        }
    }

    clear() {
        for (const path of this.map.values()) {
            this.deleteAllFromPath(path);
        }
    }
}
