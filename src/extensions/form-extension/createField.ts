import * as v from "valibot";

export type FormFieldProxy<T> = {
    [K in keyof Required<T>]: (value: T[K]) => FormFieldProxy<T>;
} & { toJSON: () => T; get<K extends keyof Required<T>>(key: K): T[K] };

export type FormFieldType<TEntries extends v.ObjectEntries = v.ObjectEntries> =
    v.ObjectSchema<TEntries, undefined>;

export function createField<TEntries extends v.ObjectEntries = v.ObjectEntries>(
    fieldType: FormFieldType<TEntries>,
    field: v.InferInput<FormFieldType<TEntries>>,
) {
    const parsedField = v.parse(fieldType, field);

    const proxy: Record<string, unknown> = {};
    const entries = Object.entries(fieldType.entries) as [
        string,
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    ][];

    for (const [key, schema] of entries) {
        Object.defineProperty(proxy, key, {
            enumerable: true,
            configurable: false,
            value: (value: unknown) => {
                v.assert(schema, value);
                Reflect.set(parsedField, key, value);
                return proxy;
            },
        });
    }

    Object.defineProperty(proxy, "toJSON", {
        enumerable: false,
        configurable: false,
        value: () => parsedField,
    });

    Object.defineProperty(proxy, "get", {
        enumerable: false,
        configurable: false,
        value: (key: string) => Reflect.get(parsedField, key),
    });

    return proxy as unknown as FormFieldProxy<
        v.InferOutput<FormFieldType<TEntries>>
    >;
}
