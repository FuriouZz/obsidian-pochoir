/**
 * Merges the two given Records, recursively merging any nested Records with the
 * second collection overriding the first in case of conflict
 *
 * For arrays, maps and sets, a merging strategy can be specified to either
 * `replace` values, or `merge` them instead. Use `includeNonEnumerable` option
 * to include non-enumerable properties too.
 *
 * @example
 * ```ts
 * import { deepMerge } from "https://deno.land/std@$STD_VERSION/collections/deep_merge.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/assert/assert_equals.ts";
 *
 * const a = { foo: true };
 * const b = { foo: { bar: true } };
 *
 * assertEquals(deepMerge(a, b), { foo: { bar: true } });
 * ```
 */
export declare function deepMerge<T extends Record<PropertyKey, unknown>>(record: Partial<Readonly<T>>, other: Partial<Readonly<T>>, options?: Readonly<DeepMergeOptions>): T;
/**
 * Merges the two given Records, recursively merging any nested Records with the
 * second collection overriding the first in case of conflict
 *
 * For arrays, maps and sets, a merging strategy can be specified to either
 * `replace` values, or `merge` them instead. Use `includeNonEnumerable` option
 * to include non-enumerable properties too.
 *
 * @example
 * ```ts
 * import { deepMerge } from "https://deno.land/std@$STD_VERSION/collections/deep_merge.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/assert/assert_equals.ts";
 *
 * const a = { foo: true };
 * const b = { foo: { bar: true } };
 *
 * assertEquals(deepMerge(a, b), { foo: { bar: true } });
 * ```
 */
export declare function deepMerge<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>, Options extends DeepMergeOptions>(record: Readonly<T>, other: Readonly<U>, options?: Readonly<Options>): DeepMerge<T, U, Options>;
/** Merging strategy */
export type MergingStrategy = "replace" | "merge";
/** Deep merge options */
export type DeepMergeOptions = {
    /** Merging strategy for arrays */
    arrays?: MergingStrategy;
    /** Merging strategy for Maps */
    maps?: MergingStrategy;
    /** Merging strategy for Sets */
    sets?: MergingStrategy;
};
/**
 * How does recursive typing works ?
 *
 * Deep merging process is handled through `DeepMerge<T, U, Options>` type.
 * If both T and U are Records, we recursively merge them,
 * else we treat them as primitives.
 *
 * Merging process is handled through `Merge<T, U>` type, in which
 * we remove all maps, sets, arrays and records so we can handle them
 * separately depending on merging strategy:
 *
 *    Merge<
 *      {foo: string},
 *      {bar: string, baz: Set<unknown>},
 *    > // "foo" and "bar" will be handled with `MergeRightOmitComplexes`
 *      // "baz" will be handled with `MergeAll*` type
 *
 * `MergeRightOmitComplexes<T, U>` will do the above: all T's
 * exclusive keys will be kept, though common ones with U will have their
 * typing overridden instead:
 *
 *    MergeRightOmitComplexes<
 *      {foo: string, baz: number},
 *      {foo: boolean, bar: string}
 *    > // {baz: number, foo: boolean, bar: string}
 *      // "baz" was kept from T
 *      // "foo" was overridden by U's typing
 *      // "bar" was added from U
 *
 * For Maps, Arrays, Sets and Records, we use `MergeAll*<T, U>` utility
 * types. They will extract relevant data structure from both T and U
 * (providing that both have same data data structure, except for typing).
 *
 * From these, `*ValueType<T>` will extract values (and keys) types to be
 * able to create a new data structure with an union typing from both
 * data structure of T and U:
 *
 *    MergeAllSets<
 *      {foo: Set<number>},
 *      {foo: Set<string>}
 *    > // `SetValueType` will extract "number" for T
 *      // `SetValueType` will extract "string" for U
 *      // `MergeAllSets` will infer type as Set<number|string>
 *      // Process is similar for Maps, Arrays, and Sets
 *
 * `DeepMerge<T, U, Options>` is taking a third argument to be handle to
 * infer final typing depending on merging strategy:
 *
 *    & (Options extends { sets: "replace" } ? PartialByType<U, Set<unknown>>
 *      : MergeAllSets<T, U>)
 *
 * In the above line, if "Options" have its merging strategy for Sets set to
 * "replace", instead of performing merging of Sets type, it will take the
 * typing from right operand (U) instead, effectively replacing the typing.
 *
 * An additional note, we use `ExpandRecursively<T>` utility type to expand
 * the resulting typing and hide all the typing logic of deep merging so it is
 * more user friendly.
 */
/** Force intellisense to expand the typing to hide merging typings */
export type ExpandRecursively<T> = T extends Record<PropertyKey, unknown> ? T extends infer O ? {
    [K in keyof O]: ExpandRecursively<O[K]>;
} : never : T;
/** Filter of keys matching a given type */
export type PartialByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
};
/** Get set values type */
export type SetValueType<T> = T extends Set<infer V> ? V : never;
/** Merge all sets types definitions from keys present in both objects */
export type MergeAllSets<T, U, X = PartialByType<T, Set<unknown>>, Y = PartialByType<U, Set<unknown>>, Z = {
    [K in keyof X & keyof Y]: Set<SetValueType<X[K]> | SetValueType<Y[K]>>;
}> = Z;
/** Get array values type */
export type ArrayValueType<T> = T extends Array<infer V> ? V : never;
/** Merge all sets types definitions from keys present in both objects */
export type MergeAllArrays<T, U, X = PartialByType<T, Array<unknown>>, Y = PartialByType<U, Array<unknown>>, Z = {
    [K in keyof X & keyof Y]: Array<ArrayValueType<X[K]> | ArrayValueType<Y[K]>>;
}> = Z;
/** Get map values types */
export type MapKeyType<T> = T extends Map<infer K, unknown> ? K : never;
/** Get map values types */
export type MapValueType<T> = T extends Map<unknown, infer V> ? V : never;
/** Merge all sets types definitions from keys present in both objects */
export type MergeAllMaps<T, U, X = PartialByType<T, Map<unknown, unknown>>, Y = PartialByType<U, Map<unknown, unknown>>, Z = {
    [K in keyof X & keyof Y]: Map<MapKeyType<X[K]> | MapKeyType<Y[K]>, MapValueType<X[K]> | MapValueType<Y[K]>>;
}> = Z;
/** Merge all records types definitions from keys present in both objects */
export type MergeAllRecords<T, U, Options, X = PartialByType<T, Record<PropertyKey, unknown>>, Y = PartialByType<U, Record<PropertyKey, unknown>>, Z = {
    [K in keyof X & keyof Y]: DeepMerge<X[K], Y[K], Options>;
}> = Z;
/** Exclude map, sets and array from type */
export type OmitComplexes<T> = Omit<T, keyof PartialByType<T, Map<unknown, unknown> | Set<unknown> | Array<unknown> | Record<PropertyKey, unknown>>>;
/** Object with keys in either T or U but not in both */
export type ObjectXorKeys<T, U, X = Omit<T, keyof U> & Omit<U, keyof T>, Y = {
    [K in keyof X]: X[K];
}> = Y;
/** Merge two objects, with left precedence */
export type MergeRightOmitComplexes<T, U, X = ObjectXorKeys<T, U> & OmitComplexes<{
    [K in keyof U]: U[K];
}>> = X;
/** Merge two objects */
export type Merge<T, U, Options, X = MergeRightOmitComplexes<T, U> & MergeAllRecords<T, U, Options> & (Options extends {
    sets: "replace";
} ? PartialByType<U, Set<unknown>> : MergeAllSets<T, U>) & (Options extends {
    arrays: "replace";
} ? PartialByType<U, Array<unknown>> : MergeAllArrays<T, U>) & (Options extends {
    maps: "replace";
} ? PartialByType<U, Map<unknown, unknown>> : MergeAllMaps<T, U>)> = ExpandRecursively<X>;
/** Merge deeply two objects */
export type DeepMerge<T, U, Options = Record<string, MergingStrategy>> = [
    T,
    U
] extends [Record<PropertyKey, unknown>, Record<PropertyKey, unknown>] ? Merge<T, U, Options> : T | U;
//# sourceMappingURL=deep_merge.d.ts.map