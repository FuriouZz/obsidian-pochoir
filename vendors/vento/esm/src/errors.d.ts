declare class VentoBaseError extends Error {
    name: string;
}
export declare class TemplateError extends VentoBaseError {
    path: string;
    source: string;
    position: number;
    constructor(path?: string, source?: string, position?: number, cause?: Error);
}
export declare class TransformError extends VentoBaseError {
    position: number;
    constructor(message: string, position?: number, cause?: Error);
}
/** Returns the number and code of the errored line */
export declare function errorLine(source: string, position: number): {
    line: number;
    column: number;
    code: string;
};
export {};
//# sourceMappingURL=errors.d.ts.map