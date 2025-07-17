import { type App, Modal, parseYaml, Setting } from "obsidian";
import type { Extension } from "../environment";
import type { TemplateContext } from "../template";

export interface FormInfo {
    title: string;
    description: string;
}

export interface BaseFieldType {
    type: string;
    name: string;
    label: string;
    description?: string;
}

export interface TextFieldType extends BaseFieldType {
    type: "text";
    defaultValue?: string;
    placeholder?: string;
}

export interface DateFieldType extends BaseFieldType {
    type: "date";
    defaultValue?: string;
    placeholder?: string;
}

export interface TimeFieldType extends BaseFieldType {
    type: "time";
    defaultValue?: string;
    placeholder?: string;
}

export interface SliderFieldType extends BaseFieldType {
    type: "slider";
    defaultValue?: number;
}

export interface TextAreaFieldType extends BaseFieldType {
    type: "textarea";
    defaultValue?: string;
    placeholder?: string;
}

export interface NumberFieldType extends BaseFieldType {
    type: "number";
    defaultValue?: number;
    placeholder?: string;
}

export interface ToggleFieldType extends BaseFieldType {
    type: "toggle";
    defaultValue?: boolean;
}

export interface DropdownFieldType extends BaseFieldType {
    type: "dropdown";
    options: Record<string, string>;
    defaultValue?: string;
}

export type FieldType =
    | TextFieldType
    | TextAreaFieldType
    | NumberFieldType
    | ToggleFieldType
    | DropdownFieldType
    | DateFieldType
    | TimeFieldType
    | SliderFieldType;

abstract class Field<T extends FieldType = FieldType> {
    data: T;

    constructor(data: T) {
        this.data = data;
    }

    name(value: string) {
        this.data.name = value;
        return this;
    }

    label(value: string) {
        this.data.label = value;
        return this;
    }

    description(value: string) {
        this.data.description = value;
        return this;
    }

    desc(value: string) {
        return this.description(value);
    }

    createSetting(el: HTMLElement, _result: Record<string, unknown>) {
        const field = this.data;
        const s = new Setting(el).setName(field.label);
        if (field.description) s.setDesc(field.description);
        return s;
    }
}

class TextField extends Field<TextFieldType> {
    defaultValue(value: string | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    placeholder(value: string) {
        this.data.placeholder = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addText((cmp) => {
            if (field.placeholder) cmp.setPlaceholder(field.placeholder);
            cmp.onChange((value) => {
                result[field.name] = value;
            });
            if (typeof field.defaultValue === "string") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class TextAreaField extends Field<TextAreaFieldType> {
    defaultValue(value: string | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    placeholder(value: string) {
        this.data.placeholder = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addTextArea((cmp) => {
            if (field.placeholder) cmp.setPlaceholder(field.placeholder);
            cmp.onChange((value) => {
                result[field.name] = value;
            });
            if (typeof field.defaultValue === "string") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class NumberField extends Field<NumberFieldType> {
    defaultValue(value: number | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    placeholder(value: string) {
        this.data.placeholder = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addText((cmp) => {
            if (field.placeholder) cmp.setPlaceholder(field.placeholder);
            cmp.inputEl.type = "number";
            cmp.onChange((value) => {
                result[field.name] = Number(value);
            });
            if (typeof field.defaultValue === "number") {
                cmp.setValue(String(field.defaultValue));
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class DateField extends Field<DateFieldType> {
    defaultValue(value: string | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    placeholder(value: string) {
        this.data.placeholder = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addText((cmp) => {
            if (field.placeholder) cmp.setPlaceholder(field.placeholder);
            cmp.inputEl.type = "date";
            cmp.onChange((value) => {
                result[field.name] = value;
            });
            if (typeof field.defaultValue === "string") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class TimeField extends Field<TimeFieldType> {
    defaultValue(value: string | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    placeholder(value: string) {
        this.data.placeholder = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addText((cmp) => {
            if (field.placeholder) cmp.setPlaceholder(field.placeholder);
            cmp.inputEl.type = "time";
            cmp.onChange((value) => {
                result[field.name] = value;
            });
            if (typeof field.defaultValue === "string") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class SliderField extends Field<SliderFieldType> {
    defaultValue(value: number | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addSlider((cmp) => {
            cmp.onChange((value) => {
                result[field.name] = Number(value);
            });
            if (typeof field.defaultValue === "number") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class ToggleField extends Field<ToggleFieldType> {
    defaultValue(value: boolean | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addToggle((cmp) => {
            cmp.onChange((value) => {
                result[field.name] = Number(value);
            });
            if (typeof field.defaultValue === "boolean") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class DropdownField extends Field<DropdownFieldType> {
    defaultValue(value: string | undefined) {
        this.data.defaultValue = value;
        return this;
    }

    option(value: string, key?: string) {
        this.data.options[value] = key ?? value;
        return this;
    }

    createSetting(el: HTMLElement, result: Record<string, unknown>) {
        const field = this.data;
        return super.createSetting(el, result).addDropdown((cmp) => {
            cmp.addOptions(field.options);
            cmp.onChange((value) => {
                result[field.name] = value;
            });
            if (typeof field.defaultValue === "string") {
                cmp.setValue(field.defaultValue);
            }
            result[field.name] = cmp.getValue();
        });
    }
}

class Form {
    modal: Modal;
    fields: Field[] = [];
    info: FormInfo = {
        title: "Insert template",
        description: "Please fill in the form",
    };
    result: Record<string, unknown> = {};

    constructor(app: App) {
        this.modal = new Modal(app);
    }

    title(title: string) {
        this.info.title = title;
    }

    description(description: string) {
        this.info.description = description;
    }

    text(name: string, options?: Omit<TextFieldType, "type">) {
        return this.field(
            new TextField({
                name,
                label: name,
                type: "text",
                ...options,
            }),
        );
    }

    textarea(name: string, options?: Omit<TextAreaFieldType, "type">) {
        return this.field(
            new TextAreaField({
                name,
                label: name,
                type: "textarea",
                ...options,
            }),
        );
    }

    number(name: string, options?: Omit<NumberFieldType, "type">) {
        return this.field(
            new NumberField({
                name,
                label: name,
                type: "number",
                ...options,
            }),
        );
    }

    date(name: string, options?: Omit<DateFieldType, "type">) {
        return this.field(
            new DateField({
                name,
                label: name,
                type: "date",
                ...options,
            }),
        );
    }

    time(name: string, options?: Omit<TimeFieldType, "type">) {
        return this.field(
            new TimeField({
                name,
                label: name,
                type: "time",
                ...options,
            }),
        );
    }

    slider(name: string, options?: Omit<SliderFieldType, "type">) {
        return this.field(
            new SliderField({
                name,
                label: name,
                type: "slider",
                ...options,
            }),
        );
    }

    toggle(name: string, options?: Omit<ToggleFieldType, "type">) {
        return this.field(
            new ToggleField({
                name,
                label: name,
                type: "toggle",
                ...options,
            }),
        );
    }

    dropdown(name: string, options?: Omit<DropdownFieldType, "type">) {
        return this.field(
            new DropdownField({
                name,
                label: name,
                type: "dropdown",
                options: {},
                ...options,
            }),
        );
    }

    field(field: Field) {
        this.fields.push(field);
        if (typeof field.data.defaultValue !== "undefined") {
            this.result[field.data.name] = field.data.defaultValue;
        }
        return field;
    }

    reset() {
        this.result = {};
        for (const field of this.fields) {
            if (typeof field.data.defaultValue !== "undefined") {
                this.result[field.data.name] = field.data.defaultValue;
            }
        }
        return this;
    }

    fromObject(obj: Record<string, FieldType>) {
        for (const [key, value] of Object.entries(obj)) {
            if (value.type in this) {
                // biome-ignore lint/suspicious/noExplicitAny: value is known here
                this[value.type](key, value as any);
            }
        }
        return this;
    }

    prompt() {
        return new Promise<Record<string, unknown>>((resolve) => {
            const { modal, result } = this;

            modal.contentEl.empty();

            modal.setTitle(this.info.title);
            modal.contentEl.createEl("p", { text: this.info.description });

            for (const field of this.fields) {
                field.createSetting(modal.contentEl, result);
            }

            let cancelled = true;
            modal.onClose = () => {
                resolve(cancelled ? {} : result);
            };

            new Setting(modal.contentEl).addButton((btn) => {
                btn.setButtonText("Validate")
                    .setCta()
                    .onClick(() => {
                        cancelled = false;
                        modal.close();
                    });
            });

            // Add event listener for Enter key to trigger the button
            modal.contentEl.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault(); // Prevent default form submission behavior
                    cancelled = false;
                    modal.close();
                }
            });

            modal.open();
        });
    }
}

class FormContext {
    app: App;
    forms = new WeakMap<TemplateContext, Map<string, Form>>();

    constructor(app: App) {
        this.app = app;
    }

    getFormMap(ctx: TemplateContext) {
        let forms = this.forms.get(ctx);
        if (!forms) {
            forms = new Map<string, Form>();
            this.forms.set(ctx, forms);
        }
        return forms;
    }

    createForm(ctx: TemplateContext, name?: string) {
        const forms = this.getFormMap(ctx);
        const _name = name ?? `form${forms.size}`;
        let form = forms.get(_name);
        if (!form) {
            form = new Form(this.app);
            forms.set(_name, form);
        }
        return form;
    }

    createAPI(ctx: TemplateContext) {
        return {
            getForms: () => {
                return this.getFormMap(ctx);
            },
            getForm: (name: string) => {
                return this.getFormMap(ctx).get(name);
            },
            createForm: (name?: string) => {
                return this.createForm(ctx, name);
            },
        };
    }
}

export default function (): Extension {
    return (env) => {
        const formContext = new FormContext(env.app);

        env.loaders.push({
            contextMode: "shared",
            test: "pochoir:form",
            load: async (_, ctx) => formContext.createAPI(ctx),
        });

        env.processors.set("codeblock:form", {
            type: "codeblock",
            test: /form/,
            order: 40,
            process: async ({ codeBlock, context }) => {
                const { name, exports } = codeBlock.attributes;

                const form = formContext.createForm(
                    context,
                    typeof name === "string" ? name : undefined,
                );
                const obj = parseYaml(codeBlock.code.replace(/\t/g, " "));
                form.fromObject(obj);

                if (typeof exports === "string") {
                    context.locals.exports[exports] = await form.prompt();
                }
            },
        });
    };
}
