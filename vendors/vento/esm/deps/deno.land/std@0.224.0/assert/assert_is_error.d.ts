/**
 * Make an assertion that `error` is an `Error`.
 * If not then an error will be thrown.
 * An error class and a string that should be included in the
 * error message can also be asserted.
 *
 * @example
 * ```ts
 * import { assertIsError } from "https://deno.land/std@$STD_VERSION/assert/assert_is_error.ts";
 *
 * assertIsError(null); // Throws
 * assertIsError(new RangeError("Out of range")); // Doesn't throw
 * assertIsError(new RangeError("Out of range"), SyntaxError); // Throws
 * assertIsError(new RangeError("Out of range"), SyntaxError, "Out of range"); // Doesn't throw
 * assertIsError(new RangeError("Out of range"), SyntaxError, "Within range"); // Throws
 * ```
 */
export declare function assertIsError<E extends Error = Error>(error: unknown, ErrorClass?: new (...args: any[]) => E, msgMatches?: string | RegExp, msg?: string): asserts error is E;
//# sourceMappingURL=assert_is_error.d.ts.map