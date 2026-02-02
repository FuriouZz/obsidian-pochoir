import { type App, ItemView, Modal, Setting } from "obsidian";
import { LOGGER } from "./logger";

export type ConfirmationResult<T> = { cancelled: boolean; result: T };

export interface ConfirmationParameters<T> {
    root: HTMLElement;
    value?: T;
    on: (event: "close", cb: () => void) => void;
    setTitle: (value: string) => void;
    setDesc: (value: string | DocumentFragment) => void;
    cancel: () => void;
    close: () => void;
}

export interface ConfirmationState<T = unknown> {
    createContent: (params: ConfirmationParameters<T>) => void;
    close?: () => void;
    done: (result?: T) => void;
    cancel: () => void;
}

function createModal<T>(app: App, state: ConfirmationState<T>) {
    const modal = new Modal(app);
    modal.contentEl.empty();
    modal.open();
    modal.onClose = () => {
        modal.contentEl.dispatchEvent(new CustomEvent("confirmation:close"));
    };

    let descriptionEl: HTMLElement | undefined;

    const p: ConfirmationParameters<T> = {
        root: modal.contentEl,
        on(event, cb) {
            modal.contentEl.addEventListener(`confirmation:${event}`, cb);
        },
        setTitle(value) {
            modal.setTitle(value);
        },
        setDesc(value) {
            if (!descriptionEl) {
                descriptionEl = modal.contentEl.createEl("p");
            }
            descriptionEl.setText(value);
        },
        cancel() {
            modal.close();
            state.close?.();
            state.cancel();
        },
        close() {
            modal.close();
            state.close?.();
            state.done(p.value);
        },
    };

    state.createContent(p);
}

async function createView<T>(app: App, state: ConfirmationState<T>) {
    app.workspace.detachLeavesOfType(ConfirmationView.type);
    const leaf = app.workspace.getLeaf(false);
    const prevState = leaf.getViewState();
    await leaf.setViewState({ type: ConfirmationView.type, active: true });
    await app.workspace.revealLeaf(leaf);

    if (leaf.view instanceof ConfirmationView) {
        leaf.view.confirmationState = {
            ...state,
            close() {
                leaf.setViewState(prevState).catch(LOGGER.error);
            },
        } as ConfirmationState;
        return leaf.view.openConfirmation();
    }
}

class ConfirmationView extends ItemView {
    static type = "POCHOIR_CONFIRMATION_VIEW";

    confirmationState?: ConfirmationState;

    getViewType(): string {
        return ConfirmationView.type;
    }

    getDisplayText(): string {
        return "Confirmation";
    }

    async openConfirmation() {
        if (!this.confirmationState) return;
        const state = this.confirmationState;

        this.contentEl.empty();

        const p: ConfirmationParameters<unknown> = {
            root: this.contentEl,
            value: null,
            on: (event, cb) => {
                this.contentEl.addEventListener(`confirmation:${event}`, cb);
            },
            setTitle: (value) => {
                this.contentEl.createDiv({
                    text: value,
                    cls: "confirmation-title",
                });
            },
            setDesc: (value) => {
                this.contentEl.createEl("p", { text: value });
            },
            cancel() {
                state.close?.();
                state.cancel();
            },
            close: () => {
                state.close?.();
                state.done(p.value);
            },
        };

        state.createContent(p);
    }

    async onOpen() {
        return this.openConfirmation();
    }

    async onClose() {
        this.contentEl.dispatchEvent(new CustomEvent("confirmation:close"));
        return Promise.resolve();
    }
}

export function promptConfirmation<T = unknown>(
    app: App,
    userState: {
        createContent: ConfirmationState<T>["createContent"];
        onCancel?: () => void;
    },
    target: "view" | "modal" = "modal",
) {
    return new Promise<T | undefined>((resolve, reject) => {
        const createButtons = (params: ConfirmationParameters<T>) => {
            new Setting(params.root)
                .addButton((btn) => {
                    btn.setButtonText("Validate")
                        .setCta()
                        .onClick(params.close);
                })
                .addButton((btn) => {
                    btn.setButtonText("Cancel").onClick(params.cancel);
                });
        };

        const state: ConfirmationState<T> = {
            createContent(params) {
                userState.createContent(params);
                createButtons(params);
            },
            done(result) {
                resolve(result);
            },
            cancel() {
                const e = new Error();
                try {
                    userState.onCancel?.();
                } catch (err) {
                    e.cause = err;
                }
                reject(e);
            },
        };

        if (target === "view") {
            createView<T>(app, state).then(() => {}, reject);
        } else {
            createModal<T>(app, state);
        }
    });
}

export function promptTextConfirmation(
    app: App,
    userState: {
        onCancel?: () => void;
        defaultValue?: string;
    },
    target: "view" | "modal" = "modal",
) {
    return promptConfirmation<string>(
        app,
        {
            ...userState,
            createContent(params) {
                params.setTitle("Confirm note name");
                new Setting(params.root).addText((c) => {
                    if (userState.defaultValue)
                        c.setValue(userState.defaultValue);
                    c.onChange((value) => {
                        params.value = value;
                    });
                });
            },
        },
        target,
    );
}
