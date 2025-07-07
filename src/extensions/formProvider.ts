import { type App, Modal, parseYaml, Setting } from "obsidian";
import type { Extension } from "../environment";
import { FileBuilder } from "src/file";

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
  fields: Field[] = [];
  data: FormInfo = {
    title: "Insert template",
    description: "Please fill in the form",
  };
  modal: Modal;

  constructor(app: App) {
    this.modal = new Modal(app);
  }

  text(name: string, options?: Omit<TextFieldType, "type">) {
    const field = new TextField({
      name,
      label: name,
      type: "text",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  textarea(name: string, options?: Omit<TextAreaFieldType, "type">) {
    const field = new TextAreaField({
      name,
      label: name,
      type: "textarea",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  number(name: string, options?: Omit<NumberFieldType, "type">) {
    const field = new NumberField({
      name,
      label: name,
      type: "number",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  date(name: string, options?: Omit<DateFieldType, "type">) {
    const field = new DateField({
      name,
      label: name,
      type: "date",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  time(name: string, options?: Omit<TimeFieldType, "type">) {
    const field = new TimeField({
      name,
      label: name,
      type: "time",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  slider(name: string, options?: Omit<SliderFieldType, "type">) {
    const field = new SliderField({
      name,
      label: name,
      type: "slider",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  toggle(name: string, options?: Omit<ToggleFieldType, "type">) {
    const field = new ToggleField({
      name,
      label: name,
      type: "toggle",
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  dropdown(name: string, options?: Omit<DropdownFieldType, "type">) {
    const field = new DropdownField({
      name,
      label: name,
      type: "dropdown",
      options: {},
      ...options,
    });
    this.fields.push(field);
    return field;
  }

  fromObject(obj: Record<string, FieldType>) {
    for (const [key, value] of Object.entries(obj)) {
      if (value.type in this) {
        // biome-ignore lint/suspicious/noExplicitAny: value is known here
        this[value.type](key, value as any);
      }
    }
  }

  prompt() {
    return new Promise<Record<string, unknown>>((resolve) => {
      const { modal } = this;

      modal.contentEl.empty();

      modal.setTitle(this.data.title);
      modal.contentEl.createEl("p", { text: this.data.description });

      const result: Record<string, unknown> = {};
      for (const field of this.fields) {
        if (typeof field.data.defaultValue !== "undefined") {
          result[field.data.name] = field.data.defaultValue;
        }
        field.createSetting(modal.contentEl, result);
      }

      let cancelled = true;
      modal.onClose = () => {
        resolve(cancelled ? {} : result);
      };

      new Setting(modal.contentEl).addButton((btn) => {
        btn
          .setButtonText("Validate")
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

interface FormAPI {
  forms?: Map<string, Form>;
  create(): Form;
}

declare module "../template" {
  interface TemplateContextGlobals {
    form: FormAPI;
    forms: FormAPI["forms"];
  }
}

export default function (): Extension {
  return (env) => {
    env.variables.push((context) => {
      const api: FormAPI = {
        forms: new Map(),
        create() {
          return new Form(env.plugin.app);
        },
      };
      context.globals.form = api;
      Object.defineProperty(context.globals, "forms", {
        enumerable: true,
        configurable: false,
        get() {
          return api.forms;
        },
      });
    });

    const langRegex = /form/;
    env.codeBlocks.push(async ({ codeBlock, context }) => {
      if (!langRegex.test(codeBlock.language)) return false;

      const obj = parseYaml(codeBlock.code.replace(/\t/g, " "));

      const form = new Form(env.plugin.app);
      form.fromObject(obj);

      const { name, exports } = codeBlock.attributes;

      if (typeof exports === "string") {
        context.locals.exports[exports] = await form.prompt();
      }

      if (typeof name === "string") {
        const api = context.globals.form;
        if (!api.forms) api.forms = new Map();
        api.forms.set(name, form);
      }

      return true;
    });
  };
}
