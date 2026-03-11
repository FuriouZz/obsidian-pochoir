import {
    type App,
    Modal as ObsidianModal,
    ItemView as ObsidianView,
} from "obsidian";
import { LOGGER } from "../logger";

export interface ViewParameters {
    readonly element: HTMLElement;
    setTitle: (title: string) => void;
    setDesc: (title: string | DocumentFragment) => void;
    close: () => Promise<void>;
    view?: View;
    modal?: Modal;
}

export interface ViewOptions<
    TParameters extends ViewParameters = ViewParameters,
> {
    type?: "modal" | "view";
    viewTitle?: string;
    onOpen?: (params: TParameters) => void;
    onClose?: (params: TParameters) => void;
}

export class View extends ObsidianView {
    static type = "POCHOIR_CUSTOM_VIEW";
    static title = "Pochoir";

    titleEl: HTMLElement | undefined;
    descEl: HTMLElement | undefined;

    triggers?: {
        open?: (view: View) => void;
        close?: (view: View) => void;
    };

    getViewType(): string {
        return View.type;
    }

    getDisplayText(): string {
        return View.title;
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

    getParameters(): ViewParameters {
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

export class Modal extends ObsidianModal {
    triggers?: {
        open?: (view: Modal) => void;
        close?: (view: Modal) => void;
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

    getParameters(): ViewParameters {
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

async function createObsidianView(app: App, content: ViewOptions) {
    View.title = content.viewTitle ?? "Pochoir";

    app.workspace.detachLeavesOfType(View.type);
    const leaf = app.workspace.getLeaf(false);
    const prevState = leaf.getViewState();
    await leaf.setViewState({ type: View.type, active: true });
    await app.workspace.revealLeaf(leaf);
    if (!(leaf.view instanceof View)) return;

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

function createObsidianModal(app: App, content: ViewOptions) {
    const modal = new Modal(app);
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

export function createView(app: App, content: ViewOptions) {
    if (content.type === "view") {
        return createObsidianView(app, content);
    }
    return Promise.resolve(createObsidianModal(app, content));
}
