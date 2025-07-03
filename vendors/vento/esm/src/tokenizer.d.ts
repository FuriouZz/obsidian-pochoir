import "../_dnt.polyfills.js";
export type TokenType = "string" | "tag" | "filter" | "comment";
export type Token = [TokenType, string, number?];
export interface TokenizeResult {
    tokens: Token[];
    position: number;
    error: Error | undefined;
}
export default function tokenize(source: string): TokenizeResult;
/**
 * Parse a tag and return the indexes of the start and end brackets, and the filters between.
 * For example: {{ tag |> filter1 |> filter2 }} => [2, 9, 20, 31]
 */
export declare function parseTag(source: string): number[];
//# sourceMappingURL=tokenizer.d.ts.map