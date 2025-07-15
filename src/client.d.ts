import "obsidian";

declare module "obsidian" {
    interface WorkspaceRibbonItem {
        id: string;
        title: string;
        icon: string;
        hidden: boolean;
        buttonEl: HTMLElement;
        callback: () => unknown;
    }

    interface WorkspaceRibbon {
        items: WorkspaceRibbonItem[];
        removeRibbonAction(id: string): void;
    }
}
