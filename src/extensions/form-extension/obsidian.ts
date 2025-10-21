import { type App, ItemView, Modal, Setting } from "obsidian";
import type { InferOutput } from "valibot";
import type { FormJSON } from "./createForm";
import type { TextField } from "./fields";
import {
    DateFieldSetting,
    DropdownFieldSetting,
    NumberFieldSetting,
    SliderFieldSetting,
    TextAreaFieldSetting,
    TextFieldSetting,
    TimeFieldSetting,
    ToggleFieldSetting,
} from "./settings";

const SETTINGS = {
    text: TextFieldSetting,
    textarea: TextAreaFieldSetting,
    number: NumberFieldSetting,
    toggle: ToggleFieldSetting,
    slider: SliderFieldSetting,
    date: DateFieldSetting,
    time: TimeFieldSetting,
    dropdown: DropdownFieldSetting,
};

interface FormState {
    form: FormJSON;
    close?: () => void;
    done: (result: Record<string, unknown>) => void;
    cancel: () => void;
    [key: string]: unknown;
}

function createFormSettings(
    el: HTMLElement,
    form: FormJSON,
    modal: {
        setTitle(value: string): void;
        setDesc(value: string): void;

        close(): void;
    },
) {
    modal.setTitle(form.title);
    modal.setDesc(form.description);

    const result: Record<string, unknown> = {};

    for (const field of form.fields as InferOutput<typeof TextField>[]) {
        const setting = new Setting(el);
        const createSetting = SETTINGS[field.type];
        createSetting({ setting, field, data: result });
    }

    let cancelled = true;

    new Setting(el)
        .addButton((btn) => {
            btn.setButtonText("Validate")
                .setCta()
                .onClick(() => {
                    cancelled = false;
                    modal.close();
                });
        })
        .addButton((btn) => {
            btn.setButtonText("Cancel")
                // .setCta()
                .onClick(() => {
                    cancelled = true;
                    modal.close();
                });
        });

    // Add event listener for Enter key to trigger the button
    el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default form submission behavior
            cancelled = false;
            modal.close();
        }
    });

    return new Promise<{ cancelled: boolean; result: Record<string, unknown> }>(
        (resolve) => {
            el.addEventListener("form:close", () => {
                resolve({ cancelled, result });
            });
        },
    );
}

function createModal(app: App, state: FormState) {
    const modal = new Modal(app);

    modal.contentEl.empty();

    const promise = createFormSettings(modal.contentEl, state.form, {
        setTitle(value) {
            modal.setTitle(value);
        },
        setDesc(value) {
            modal.contentEl.createEl("p", { text: value });
        },
        close() {
            modal.close();
            state.close?.();
        },
    });

    modal.onClose = () => {
        modal.contentEl.dispatchEvent(new CustomEvent("form:close"));
    };

    modal.open();

    promise.then(({ cancelled, result }) => {
        if (cancelled) {
            state.cancel();
        } else {
            state.done(result);
        }
    });
}

async function createView(app: App, state: FormState) {
    app.workspace.detachLeavesOfType(FormView.type);
    const leaf = app.workspace.getLeaf(false);
    const prevState = leaf.getViewState();
    await leaf.setViewState({ type: FormView.type, active: true });
    await app.workspace.revealLeaf(leaf);
    if (leaf.view instanceof FormView) {
        leaf.view.formState = {
            ...state,
            close() {
                leaf.setViewState(prevState);
            },
            cancel() {
                state.cancel();
            },
            done(result) {
                state.done(result);
            },
        };
        return leaf.view.openForm();
    }
}

export class FormView extends ItemView {
    formState?: FormState;

    getViewType(): string {
        return FormView.type;
    }

    getDisplayText(): string {
        return "Form";
    }

    async openForm() {
        if (!this.formState) return;
        const state = this.formState;
        const promise = createFormSettings(this.contentEl, state.form, {
            setTitle: (value) => {
                this.contentEl.createDiv({
                    text: value,
                    cls: "modal-title",
                });
            },
            setDesc: (value) => {
                this.contentEl.createEl("p", { text: value });
            },
            close: () => {
                state.close?.();
                // this.leaf.detach();
            },
        });
        promise.then(({ cancelled, result }) => {
            if (cancelled) {
                state.cancel();
            } else {
                state.done(result);
            }
        });
    }

    async onOpen() {
        this.openForm();
    }

    async onClose() {
        this.contentEl.dispatchEvent(new CustomEvent("form:close"));
    }

    static type = "POCHOIR_FORM_VIEW";
}

export function promptForm(
    app: App,
    state: FormState,
    target: "view" | "modal" = "modal",
) {
    if (target === "view") createView(app, state);
    else createModal(app, state);
}
