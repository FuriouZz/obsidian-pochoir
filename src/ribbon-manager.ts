import type PochoirPlugin from "./main";

export interface RibbonCommand {
    icon: string;
    title: string;
    element: HTMLElement;
    action: () => unknown;
}

export class RibbonManager {
    plugin: PochoirPlugin;

    constructor(plugin: PochoirPlugin) {
        this.plugin = plugin;
    }

    add(title: string, icon: string, action: () => unknown) {
        this.plugin.addRibbonIcon(icon, title, action);
    }

    remove(title: string) {
        const id = `${this.plugin.manifest.id}:${title}`;
        const { leftRibbon } = this.plugin.app.workspace;
        const item = leftRibbon.items.find((item) => item.id === id);
        if (item) {
            item.buttonEl.detach();
            leftRibbon.removeRibbonAction(item.id);
        }
    }
}
