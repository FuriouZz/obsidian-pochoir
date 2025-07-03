/**
 * Executes a function, expecting it to throw. If it does not, then it
 * throws.
 *
 * To assert that an asynchronous function rejects, use
 * {@linkcode assertRejects}.
 *
 * @example
 * ```ts
 * import { assertThrows } from "https://deno.land/std@$STD_VERSION/assert/assert_throws.ts";
 *
 * assertThrows(() => { throw new TypeError("hello world!"); }); // Doesn't throw
 * assertThrows(() => console.log("hello world!")); // Throws
 * ```
 */
export declare function assertThrows(fn: () => unknown, msg?: string): unknown;
/**
 * Executes a function, expecting it to throw. If it does not, then it
 * throws. An error class and a string that should be included in the
 * error message can also be asserted.
 *
 * To assert that an asynchronous function rejects, use
 * {@linkcode assertRejects}.
 *
 * @example
 * ```ts
 * import { assertThrows } from "https://deno.land/std@$STD_VERSION/assert/assert_throws.ts";
 *
 * assertThrows(() => { throw new TypeError("hello world!"); }, TypeError); // Doesn't throw
 * assertThrows(() => { throw new TypeError("hello world!"); }, RangeError); // Throws
 * ```
 */
export declare function assertThrows<E extends Error = Error>(fn: () => unknown, ErrorClass: new (...args: any[]) => E, msgIncludes?: string, msg?: string): E;
//# sourceMappingURL=assert_throws.d.ts.map