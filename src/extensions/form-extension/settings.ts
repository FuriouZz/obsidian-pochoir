import type { Setting } from "obsidian";
import type { InferOutput } from "valibot";
import type { FormFieldType } from "./createField";
import type {
    BaseField,
    DateField,
    DropdownField,
    NumberField,
    SliderField,
    TextAreaField,
    TextField,
    TimeField,
    ToggleField,
} from "./fields";

interface FieldSettingParameter<T extends FormFieldType = FormFieldType> {
    setting: Setting;
    field: InferOutput<T>;
    data: Record<string, unknown>;
}

function watchValue<T>({
    cmp,
    data,
    field,
}: {
    field: InferOutput<typeof BaseField>;
    data: Record<string, unknown>;
    cmp: {
        onChange(cb: (value: T) => void): void;
        getValue(): T;
    };
}) {
    cmp.onChange((value) => {
        data[field.name] = value;
    });
    data[field.name] = cmp.getValue();
}

export function BaseFieldSetting({
    setting,
    field,
}: FieldSettingParameter<typeof BaseField>) {
    setting.setName(field.label ?? field.name);
    setting.setDesc(field.description ?? "");
}

export function TextFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof TextField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addText((cmp) => {
        cmp.setPlaceholder(field.placeholder ?? "");
        cmp.setValue(field.initialValue ?? "");
        watchValue({ cmp, field, data });
    });
}

export function TextAreaFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof TextAreaField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addTextArea((cmp) => {
        cmp.setPlaceholder(field.placeholder ?? "");
        cmp.setValue(field.initialValue ?? "");
        watchValue({ cmp, field, data });
    });
}

export function NumberFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof NumberField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addText((cmp) => {
        cmp.inputEl.type = "number";
        cmp.setPlaceholder(field.placeholder ?? "");
        cmp.setValue(String(field.initialValue ?? 0));
        cmp.onChange((value) => {
            data[field.name] = Number(value);
        });
        data[field.name] = Number(cmp.getValue());
    });
}

export function ToggleFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof ToggleField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addToggle((cmp) => {
        cmp.setValue(field.initialValue ?? false);
        watchValue({ cmp, field, data });
    });
}

export function DateFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof DateField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addText((cmp) => {
        cmp.inputEl.type = "date";
        cmp.setPlaceholder(field.placeholder ?? "");
        cmp.setValue(field.initialValue ?? "");
        watchValue({ cmp, field, data });
    });
}

export function TimeFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof TimeField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addText((cmp) => {
        cmp.inputEl.type = "time";
        cmp.setPlaceholder(field.placeholder ?? "");
        cmp.setValue(field.initialValue ?? "");
        watchValue({ cmp, field, data });
    });
}

export function SliderFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof SliderField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addSlider((cmp) => {
        cmp.setValue(field.initialValue ?? 0);
        watchValue({ cmp, field, data });
    });
}

export function DropdownFieldSetting({
    setting,
    field,
    data,
}: FieldSettingParameter<typeof DropdownField>) {
    BaseFieldSetting({ setting, field, data });
    setting.addDropdown((cmp) => {
        cmp.addOptions(field.options);
        cmp.setValue(field.initialValue ?? "");
        watchValue({ cmp, field, data });
    });
}
