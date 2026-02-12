import { type App, Setting } from "obsidian";
import * as v from "valibot";
import { promptConfirmation } from "../../confirmation-modal";
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

export interface FormState {
    form: FormJSON;
    onCancel?: () => void;
}

export function promptForm(
    app: App,
    target: "view" | "modal",
    state: FormState,
) {
    let schema: v.ObjectSchema<v.ObjectEntries, undefined> | undefined;
    let errorPlaceholder: HTMLElement | undefined;

    return promptConfirmation<Record<string, unknown>>(app, {
        type: target,
        onCancel: state.onCancel,

        onOpen(view) {
            const { form } = state;

            view.value = view.value ?? {};

            view.setTitle(form.title);
            view.setDesc(form.description);

            const entries: v.ObjectEntries = {};

            for (const field of form.fields as UnionField[]) {
                switch (field.type) {
                    case "dropdown":
                    case "textarea":
                    case "text": {
                        const s = v.string();
                        if (field.required) {
                            const ss = v.pipe(s, v.nonEmpty("Field is empty"));
                            entries[field.name] = ss;
                        } else {
                            entries[field.name] = s;
                        }
                        break;
                    }
                    case "slider":
                    case "number": {
                        const s = v.number();
                        entries[field.name] = s;
                        break;
                    }
                    case "toggle": {
                        const s = v.boolean();
                        entries[field.name] = s;
                        break;
                    }
                    case "date": {
                        const s = v.pipe(
                            v.string(),
                            checkMomentDate("YYYY-MM-DD", "Date is invalid"),
                        );
                        entries[field.name] = s;
                        break;
                    }
                    case "time": {
                        const s = v.pipe(
                            v.string(),
                            checkMomentDate("hh:mm", "Time is invalid"),
                        );
                        entries[field.name] = s;
                        break;
                    }
                }
            }

            schema = v.object(entries);

            for (const field of form.fields as v.InferOutput<
                typeof TextField
            >[]) {
                const setting = new Setting(view.element);
                const createSetting = SETTINGS[field.type];
                createSetting({ setting, field, data: view.value });
            }
        },

        onValidate(view) {
            if (!schema || !view.value) return true;

            const ret = v.safeParse(schema, view.value);
            if (ret.success) return true;

            const errors = new Setting(
                globalThis.document.createElement("div"),
            );

            const attr = {
                style: "color: var(--text-error);",
            };

            const name = globalThis.document.createDocumentFragment();
            name.createEl("span", {
                text: "Errors",
                attr,
            });

            const desc = globalThis.document.createDocumentFragment();

            const list = desc.createEl("ul");
            for (const issue of ret.issues) {
                const path: string | undefined = issue.path
                    ?.map((item) => item.key)
                    ?.join(".");
                list.createEl("li", {
                    text: path ? `${path}: ${issue.message}` : issue.message,
                    attr,
                });
            }

            errors.setName(name);
            errors.setDesc(desc);

            if (!errorPlaceholder) {
                errorPlaceholder = globalThis.document.createElement("div");
                view.element.prepend(errorPlaceholder);
            }
            errorPlaceholder.replaceWith(errors.settingEl);
            errorPlaceholder = errors.settingEl;

            return false;
        },
    });
}
