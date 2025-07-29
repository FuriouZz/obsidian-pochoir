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

    interface Vault {
        /**
         * Get path for file that does not conflict with other existing files
         */
        getAvailablePath(path: string, extension: string): string;

        getConfig(key: "newFileLocation"): "folder" | "current" | "root";
    }
}

declare global {
    interface ImportMetaEnv {
        MODE: string;
        PROD: boolean;
        DEV: boolean;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}
