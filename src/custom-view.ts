import { type App, ItemView, Modal } from "obsidian";
import { LOGGER } from "./logger";

export interface CustomContent<
    TParameters extends CustomContentParameters = CustomContentParameters,
> {
    type?: "modal" | "view";
    viewTitle?: string;
    onOpen?: (params: TParameters) => void;
    onClose?: (params: TParameters) => void;
}

export interface CustomContentParameters {
    readonly element: HTMLElement;
    setTitle: (title: string) => void;
    setDesc: (title: string | DocumentFragment) => void;
    close: () => Promise<void>;
    view?: CustomView;
    modal?: Modal;
}

export class CustomView extends ItemView {
    static type = "POCHOIR_CUSTOM_VIEW";
    static title = "Pochoir";

    titleEl: HTMLElement | undefined;
    descEl: HTMLElement | undefined;

    triggers?: {
        open?: (view: CustomView) => void;
        close?: (view: CustomView) => void;
    };

    getViewType(): string {
        return CustomView.type;
    }

    getDisplayText(): string {
        return CustomView.title;
    }

    setTitle(text: string) {
        if (!this.titleEl) {
            this.titleEl = this.contentEl.createEl("h2", {
                cls: "confirmation-title",
            });
        }
        this.titleEl.setText(text);
    }

    setDesc(text: string | DocumentFragment) {
        if (!this.descEl) {
            this.descEl = this.contentEl.createEl("p");
        }
        this.descEl.setText(text);
    }

    trigger(action: "open" | "close") {
        switch (action) {
            case "open": {
                return this.triggers?.open?.(this);
            }
            case "close": {
                return this.triggers?.close?.(this);
            }
        }
    }

    protected async onOpen(): Promise<void> {
        return Promise.resolve(this.trigger("open"));
    }

    protected async onClose(): Promise<void> {
        return Promise.resolve(this.trigger("close"));
    }

    getParameters(): CustomContentParameters {
        const element = this.contentEl;
        return {
            get element() {
                return element;
            },
            view: this,
            setTitle: (text) => this.setTitle(text),
            setDesc: (text) => this.setDesc(text),
            close: () => this.onClose(),
        };
    }
}

export class CustomModal extends Modal {
    triggers?: {
        open?: (view: CustomModal) => void;
        close?: (view: CustomModal) => void;
    };

    descEl: HTMLElement | undefined;

    setDesc(text: string | DocumentFragment) {
        if (!this.descEl) {
            this.descEl = this.contentEl.createEl("p");
        }
        this.descEl.setText(text);
    }

    trigger(action: "open" | "close") {
        switch (action) {
            case "open": {
                return this.triggers?.open?.(this);
            }
            case "close": {
                return this.triggers?.close?.(this);
            }
        }
    }

    onOpen() {
        this.trigger("open");
    }

    onClose() {
        this.trigger("close");
    }

    getParameters(): CustomContentParameters {
        const element = this.contentEl;
        return {
            get element() {
                return element;
            },
            modal: this,
            setTitle: (text) => this.setTitle(text),
            setDesc: (text) => this.setDesc(text),
            close: () => Promise.resolve(this.close()),
        };
    }
}

async function _createCustomView(app: App, content: CustomContent) {
    CustomView.title = content.viewTitle ?? "Pochoir";

    app.workspace.detachLeavesOfType(CustomView.type);
    const leaf = app.workspace.getLeaf(false);
    const prevState = leaf.getViewState();
    await leaf.setViewState({ type: CustomView.type, active: true });
    await app.workspace.revealLeaf(leaf);
    if (!(leaf.view instanceof CustomView)) return;

    leaf.view.triggers = {
        open(view) {
            return content.onOpen?.(view.getParameters());
        },
        close(view) {
            leaf.setViewState(prevState).catch(LOGGER.error);
            return content.onClose?.(view.getParameters());
        },
    };
    return leaf.view.trigger("open");
}

function _createCustomModal(app: App, content: CustomContent) {
    const modal = new CustomModal(app);
    modal.contentEl.empty();

    modal.triggers = {
        open(view) {
            return content.onOpen?.(view.getParameters());
        },
        close(view) {
            return content.onClose?.(view.getParameters());
        },
    };

    modal.open();
}

export function createCustomView(app: App, content: CustomContent) {
    if (content.type === "view") {
        return _createCustomView(app, content);
    }
    return Promise.resolve(_createCustomModal(app, content));
}
