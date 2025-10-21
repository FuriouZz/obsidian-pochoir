import { type App, ItemView, Modal, Setting } from "obsidian";
import * as v from "valibot";
import type { FormJSON } from "./createFormBuilder";
import type { TextField, UnionField } from "./fields";
import { checkMomentDate } from "./schemas";
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
        setDesc(value: string | DocumentFragment): void;
        close(): void;
    },
) {
    modal.setTitle(form.title);
    modal.setDesc(form.description);

    let errorPlaceholder: HTMLElement = el.createEl("div");

    const result: Record<string, unknown> = {};

    const entries: Record<string, any> = {};

    for (const field of form.fields as UnionField[]) {
        let s: any; //v.AnySchema

        switch (field.type) {
            case "dropdown":
            case "textarea":
            case "text": {
                s = v.string();
                if (field.required) {
                    s = v.pipe(s, v.nonEmpty("Field is empty"));
                }
                break;
            }
            case "slider":
            case "number": {
                s = v.number();
                break;
            }
            case "toggle": {
                s = v.boolean();
                break;
            }
            case "date": {
                s = v.pipe(
                    v.string(),
                    checkMomentDate("YYYY-MM-DD", "Date is invalid"),
                );
                break;
            }
            case "time": {
                s = v.pipe(
                    v.string(),
                    checkMomentDate("hh:mm", "Time is invalid"),
                );
                break;
            }
            default: {
                s = v.unknown();
                break;
            }
        }

        entries[field.name] = s;
    }

    const schema = v.object(entries);

    const done = () => {
        const ret = v.safeParse(schema, result);
        if (ret.success) {
            cancelled = false;
            modal.close();
        } else {
            const errors = new Setting(document.createElement("div"));

            const attr = {
                style: "color: var(--text-error);",
            };

            const name = document.createDocumentFragment();
            name.createEl("span", {
                text: "Errors",
                attr,
            });

            const desc = document.createDocumentFragment();

            const list = desc.createEl("ul");
            for (const issue of ret.issues) {
                const path = issue.path
                    .map((item: { key: string }) => item.key)
                    .join(".");
                list.createEl("li", {
                    text: `${path}: ${issue.message}`,
                    attr,
                });
            }

            errors.setName(name);
            errors.setDesc(desc);
            errorPlaceholder.replaceWith(errors.settingEl);
            errorPlaceholder = errors.settingEl;
        }
    };

    for (const field of form.fields as v.InferOutput<typeof TextField>[]) {
        const setting = new Setting(el);
        const createSetting = SETTINGS[field.type];
        createSetting({ setting, field, data: result });
    }

    let cancelled = true;

    new Setting(el)
        .addButton((btn) => {
            btn.setButtonText("Validate").setCta().onClick(done);
        })
        .addButton((btn) => {
            btn.setButtonText("Cancel").onClick(() => {
                cancelled = true;
                modal.close();
            });
        });

    // Add event listener for Enter key to trigger the button
    el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default form submission behavior
            done();
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
