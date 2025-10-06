import { toSlug } from "@furiouzz/lol/string/string";
import type { Menu } from "obsidian";
import type { Environment, Extension } from "../environment";
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
                beforePreprocess({ template }) {
                    cmd.deleteAllFromPath(template.info.file.path);
                },
                async preprocess({ codeBlock, template }) {
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

                    alertWrap(() => cmd.add(template, command));
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
                    { suggestion: "action: insert-from-selection" },
                    { suggestion: "action: insert-from-clipboard" },
                    { suggestion: "action: create" },
                    { suggestion: "action: create-from-selection" },
                    { suggestion: "action: create-from-clipboard" },
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
    action:
        | "create"
        | "create-from-selection"
        | "create-from-clipboard"
        | "insert"
        | "insert-from-selection"
        | "insert-from-clipboard";
    triggers: CommandTrigger[];
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

    performAction = async (
        currentTemplate: Template,
        action: Command["action"],
    ) => {
        let template: Template | undefined = currentTemplate;

        if (action.includes("from-selection")) {
            template = await this.env.createVirtualTemplate({
                type: "selection",
            });
        } else if (action.includes("from-clipboard")) {
            template = await this.env.createVirtualTemplate({
                type: "clipboard",
            });
        }
        if (!template) return;

        if (action.startsWith("insert")) {
            await this.env.insertFromTemplate(template);
        } else if (action.startsWith("create")) {
            await this.env.createFromTemplate(template);
        }
    };

    addRibon(template: Template, command: Command) {
        const callback = () => this.performAction(template, command.action);

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
        const callback = () => this.performAction(template, action);
        this.env.plugin.addCommand({
            id,
            name,
            callback,
        });
        this.map.set(id, template.info.file.path);
    }

    removeCommand(id: string) {
        this.env.plugin.removeCommand(id);
    }

    addEditorMenu(
        template: Template,
        { id, title: name, action, icon }: Command,
    ) {
        const callback = () => this.performAction(template, action);
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
            this.removeRibon(id);
            this.removeCommand(id);
            this.removeEditorMenu(id);
            this.map.delete(id);
        }
    }

    clear() {
        for (const [_, path] of this.map.entries()) {
            this.deleteAllFromPath(path);
        }
    }
}
