interface Success<T> {
    ok: true;
    body: T;
}
interface Failure {
    ok: false;
}
type ParseResult<T> = Success<T> | Failure;
type ParserComponent<T = unknown> = (scanner: Scanner) => ParseResult<T>;
type BlockParseResultBody = {
    type: "Block";
    value: Record<string, unknown>;
} | {
    type: "Table";
    key: string[];
    value: Record<string, unknown>;
} | {
    type: "TableArray";
    key: string[];
    value: Record<string, unknown>;
};
export declare class TOMLParseError extends Error {
}
export declare class Scanner {
    #private;
    private source;
    constructor(source: string);
    /**
     * Get current character
     * @param index - relative index from current position
     */
    char(index?: number): string;
    /**
     * Get sliced string
     * @param start - start position relative from current position
     * @param end - end position relative from current position
     */
    slice(start: number, end: number): string;
    /**
     * Move position to next
     */
    next(count?: number): void;
    /**
     * Move position until current char is not a whitespace, EOL, or comment.
     * @param options.inline - skip only whitespaces
     */
    nextUntilChar(options?: {
        inline?: boolean;
        comment?: boolean;
    }): void;
    /**
     * Position reached EOF or not
     */
    eof(): boolean;
    /**
     * Get current position
     */
    position(): number;
    isCurrentCharEOL(): boolean;
}
export declare const Utils: {
    unflat(keys: string[], values?: unknown, cObj?: unknown): Record<string, unknown>;
    deepAssignWithTable(target: Record<string, unknown>, table: {
        type: "Table" | "TableArray";
        key: string[];
        value: Record<string, unknown>;
    }): void;
};
export declare function BareKey(scanner: Scanner): ParseResult<string>;
export declare function BasicString(scanner: Scanner): ParseResult<string>;
export declare function LiteralString(scanner: Scanner): ParseResult<string>;
export declare function MultilineBasicString(scanner: Scanner): ParseResult<string>;
export declare function MultilineLiteralString(scanner: Scanner): ParseResult<string>;
export declare function Symbols(scanner: Scanner): ParseResult<unknown>;
export declare const DottedKey: ParserComponent<string[]>;
export declare function Integer(scanner: Scanner): ParseResult<number | string>;
export declare function Float(scanner: Scanner): ParseResult<number>;
export declare function DateTime(scanner: Scanner): ParseResult<Date>;
export declare function LocalTime(scanner: Scanner): ParseResult<string>;
export declare function ArrayValue(scanner: Scanner): ParseResult<unknown[]>;
export declare function InlineTable(scanner: Scanner): ParseResult<Record<string, unknown>>;
export declare const Value: ParserComponent<unknown>;
export declare const Pair: ParserComponent<{
    [key: string]: unknown;
}>;
export declare function Block(scanner: Scanner): ParseResult<BlockParseResultBody>;
export declare const TableHeader: ParserComponent<string[]>;
export declare function Table(scanner: Scanner): ParseResult<BlockParseResultBody>;
export declare const TableArrayHeader: ParserComponent<string[]>;
export declare function TableArray(scanner: Scanner): ParseResult<BlockParseResultBody>;
export declare function Toml(scanner: Scanner): ParseResult<Record<string, unknown>>;
export declare function ParserFactory<T>(parser: ParserComponent<T>): (tomlString: string) => T;
export {};
//# sourceMappingURL=_parser.d.ts.map