class VentoBaseError extends Error {
    name = this.constructor.name;
}
export class TemplateError extends VentoBaseError {
    path;
    source;
    position;
    constructor(path = "<unknown>", source = "<empty file>", position = 0, cause) {
        const { line, column, code } = errorLine(source, position);
        super(`Error in template ${path}:${line}:${column}\n\n${code.trim()}\n\n`, { cause });
        this.path = path;
        this.source = source;
        this.position = position;
    }
}
export class TransformError extends VentoBaseError {
    position;
    constructor(message, position = 0, cause) {
        super(message, { cause });
        this.position = position;
    }
}
/** Returns the number and code of the errored line */
export function errorLine(source, position) {
    let line = 1;
    let column = 1;
    for (let index = 0; index < position; index++) {
        if (source[index] === "\n" ||
            (source[index] === "\r" && source[index + 1] === "\n")) {
            line++;
            column = 1;
            if (source[index] === "\r") {
                index++;
            }
        }
        else {
            column++;
        }
    }
    return { line, column, code: source.split("\n")[line - 1] };
}
