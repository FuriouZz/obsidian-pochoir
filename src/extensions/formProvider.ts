import { type App, Modal, Setting } from "obsidian";
import type { Extension } from "src/core/Extension";

interface DefaultFieldType {
	name: string;
	label: string;
	description?: string;
}

interface TextFieldType extends DefaultFieldType {
	type: "text";
	defaultValue?: string;
	placeholder?: string;
}

interface TextAreaFieldType extends DefaultFieldType {
	type: "textarea";
	defaultValue?: string;
	placeholder?: string;
}

interface NumberFieldType extends DefaultFieldType {
	type: "number";
	defaultValue?: number;
	placeholder?: string;
}

interface ToggleFieldType extends DefaultFieldType {
	type: "toggle";
	defaultValue?: boolean;
}

interface DropdownFieldType extends DefaultFieldType {
	type: "dropdown";
	options: Record<string, string>;
	defaultValue?: string;
}

type FieldType =
	| TextFieldType
	| TextAreaFieldType
	| NumberFieldType
	| ToggleFieldType
	| DropdownFieldType;

abstract class Field<T extends FieldType = FieldType> {
	data: T;

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
				result[field.name] = Number(value);
			});
		});
	}
}

class Form {
	fields: Field[] = [];
	modal: Modal;

	constructor(app: App) {
		this.modal = new Modal(app);
	}

	text(name: string, options?: Omit<TextFieldType, "type">) {
		const field = new TextField();
		field.data = { name, label: name, type: "text", ...options };
		this.fields.push(field);
		return field;
	}

	textarea(name: string, options?: Omit<TextAreaFieldType, "type">) {
		const field = new TextAreaField();
		field.data = { name, label: name, type: "textarea", ...options };
		this.fields.push(field);
		return field;
	}

	number(name: string, options?: Omit<NumberFieldType, "type">) {
		const field = new NumberField();
		field.data = { name, label: name, type: "number", ...options };
		this.fields.push(field);
		return field;
	}

	toggle(name: string, options?: Omit<ToggleFieldType, "type">) {
		const field = new ToggleField();
		field.data = { name, label: name, type: "toggle", ...options };
		this.fields.push(field);
		return field;
	}

	dropdown(name: string, options?: Omit<DropdownFieldType, "type">) {
		const field = new DropdownField();
		field.data = {
			name,
			label: name,
			type: "dropdown",
			options: {},
			...options,
		};
		this.fields.push(field);
		return field;
	}

	prompt() {
		return new Promise<Record<string, unknown>>((resolve) => {
			const { modal } = this;

			modal.contentEl.empty();

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
	return (pochoir) => {
		pochoir.contextProviders.push((context) => {
			context.globals.createForm = () => {
				return new Form(pochoir.plugin.app);
			};
		});
	};
}
