import { type App, Modal, Setting } from "obsidian";
import type { Extension } from "../environment";

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
  | DropdownFieldType;

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
      if (typeof field.defaultValue === "string") {
        cmp.setValue(field.defaultValue);
      }
      if (field.placeholder) cmp.setPlaceholder(field.placeholder);
      cmp.onChange((value) => {
        result[field.name] = value;
      });
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
      if (typeof field.defaultValue === "string") {
        cmp.setValue(field.defaultValue);
      }
      if (field.placeholder) cmp.setPlaceholder(field.placeholder);
      cmp.onChange((value) => {
        result[field.name] = value;
      });
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
      if (typeof field.defaultValue === "number") {
        cmp.setValue(String(field.defaultValue));
      }
      if (field.placeholder) cmp.setPlaceholder(field.placeholder);
      cmp.inputEl.type = "number";
      cmp.onChange((value) => {
        result[field.name] = Number(value);
      });
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
      if (typeof field.defaultValue === "boolean") {
        cmp.setValue(field.defaultValue);
      }
      cmp.onChange((value) => {
        result[field.name] = Number(value);
      });
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
      if (typeof field.defaultValue === "string") {
        cmp.setValue(field.defaultValue);
      }
      cmp.addOptions(field.options);
      cmp.onChange((value) => {
        result[field.name] = value;
      });
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

  prompt() {
    return new Promise<Record<string, unknown>>((resolve) => {
      const { modal } = this;

      modal.contentEl.empty();

      modal.setTitle(this.data.title);
      modal.contentEl.createEl("p", { text: this.data.description });

      const result: Record<string, unknown> = {};
      for (const field of this.fields) {
        field.createSetting(modal.contentEl, result);
      }

      let cancelled = true;
      modal.onClose = () => {
        resolve(cancelled ? {} : result);
      };

      new Setting(modal.contentEl).addButton((btn) => {
        btn.setButtonText("Validate");
        btn.onClick(() => {
          cancelled = false;
          modal.close();
        });
      });

      modal.open();
    });
  }
}

export default function (): Extension {
  return (env) => {
    env.variables.push((context) => {
      const api = {
        create() {
          return new Form(env.plugin.app);
        },
      };
      context.globals.form = api;
    });
  };
}
