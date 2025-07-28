import * as v from "valibot";

const defaultLabel = <T extends { name: string; label?: string }>() =>
    v.transform((input: T) => ({ label: input.name, ...input }));

const type = <T extends string>(name: T) => v.optional(v.literal(name), name);

export const BaseField = v.pipe(
    v.object({
        name: v.string(),
        label: v.optional(v.string()),
        description: v.optional(v.string()),
    }),
    defaultLabel(),
);

export const TextField = v.pipe(
    v.object({
        ...BaseField.entries,
        type: type("text"),
        initialValue: v.optional(v.string()),
        placeholder: v.optional(v.string()),
    }),
    defaultLabel(),
);

export const TextAreaField = v.pipe(
    v.object({
        ...TextField.entries,
        type: type("textarea"),
    }),
    defaultLabel(),
);

export const NumberField = v.pipe(
    v.object({
        ...BaseField.entries,
        type: type("number"),
        initialValue: v.optional(v.number()),
        placeholder: v.optional(v.string()),
    }),
    defaultLabel(),
);

export const ToggleField = v.pipe(
    v.object({
        ...BaseField.entries,
        type: type("toggle"),
        initialValue: v.optional(v.boolean()),
        placeholder: v.optional(v.string()),
    }),
    defaultLabel(),
);

export const SliderField = v.pipe(
    v.object({
        ...BaseField.entries,
        type: type("slider"),
        initialValue: v.optional(v.number()),
    }),
    defaultLabel(),
);

export const DateField = v.pipe(
    v.object({
        ...TextField.entries,
        type: type("date"),
    }),
    defaultLabel(),
);

export const TimeField = v.pipe(
    v.object({
        ...TextField.entries,
        type: type("time"),
    }),
    defaultLabel(),
);

export const DropdownField = v.pipe(
    v.object({
        ...TextField.entries,
        type: type("dropdown"),
        options: v.optional(v.record(v.string(), v.string()), {}),
    }),
    defaultLabel(),
);

export type UnionField =
    | v.InferOutput<typeof TextField>
    | v.InferOutput<typeof TextAreaField>
    | v.InferOutput<typeof NumberField>
    | v.InferOutput<typeof ToggleField>
    | v.InferOutput<typeof SliderField>
    | v.InferOutput<typeof DateField>
    | v.InferOutput<typeof TimeField>
    | v.InferOutput<typeof DropdownField>;
