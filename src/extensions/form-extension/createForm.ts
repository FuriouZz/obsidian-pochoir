import type { InferInput, InferOutput } from "valibot";
import { createField, type FormFieldProxy } from "./createField";
import {
    DateField,
    DropdownField,
    NumberField,
    SliderField,
    TextAreaField,
    TextField,
    TimeField,
    ToggleField,
} from "./fields";

const FIELDS = {
    text: TextField,
    textarea: TextAreaField,
    number: NumberField,
    toggle: ToggleField,
    slider: SliderField,
    date: DateField,
    time: TimeField,
    dropdown: DropdownField,
};

export interface FormJSON {
    title: string;
    description: string;
    fields: unknown[];
    [key: string]: unknown;
}

export type FormBuilder = {
    [key in keyof typeof FIELDS]: (
        name: string,
        options?: InferInput<(typeof FIELDS)[key]>,
    ) => FormFieldProxy<InferOutput<(typeof FIELDS)[key]>>;
} & {
    fromJSON(json: FormJSON): void;
    toJSON(): FormJSON;
};

export function createForm() {
    const form: Record<string, unknown> = {};
    const formData = {
        title: "Insert template",
        description: "Please fill in the form",
    };
    const fields: FormFieldProxy<unknown>[] = [];

    for (const [key, fieldType] of Object.entries(FIELDS)) {
        Object.defineProperty(form, key, {
            enumerable: true,
            configurable: false,
            value: (name: string, options?: InferInput<typeof TextField>) => {
                const field = createField(fieldType as typeof TextField, {
                    name,
                    ...options,
                });
                fields.push(field);
                return field;
            },
        });
    }

    for (const key of Object.keys(formData)) {
        Object.defineProperty(form, key, {
            enumerable: true,
            configurable: false,
            value: (value: string) => {
                Reflect.set(formData, key, value);
                return form;
            },
        });
    }

    Object.defineProperty(form, "fromJSON", {
        enumerable: true,
        configurable: false,
        value: (json: FormJSON) => {
            formData.title = json.title || formData.title;
            formData.description = json.description || formData.description;
            for (const info of json.fields as InferOutput<typeof TextField>[]) {
                const fieldType = FIELDS[info.type];
                if (!fieldType) continue;
                const field = createField(fieldType, info);
                fields.push(field);
            }
        },
    });

    Object.defineProperty(form, "toJSON", {
        enumerable: true,
        configurable: false,
        value: (): FormJSON => {
            return {
                ...formData,
                fields: fields.map((field) => field.toJSON()) as InferOutput<
                    typeof TextField
                >[],
            };
        },
    });

    return form as FormBuilder;
}
