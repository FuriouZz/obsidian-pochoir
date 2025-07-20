import type { ParsedCodeBlock } from "../parser";

export const CodeBlockRegex = /`{3}(\S*)\s*(\{.*\})?([\S\s]*?)`{3}/;

export function createCodeBlockProcessorTest(
    language: string,
    attributes?: Record<string, unknown>,
) {
    return ({ codeBlock }: { codeBlock: ParsedCodeBlock }) => {
        let isValid = language === codeBlock.language;
        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                isValid = isValid && codeBlock.attributes[key] === value;
            }
        }
        if (isValid) return true;

        return false;
    };
}
export function createCodeBlockProcessorTests(
    tests: [language: string, attributes?: Record<string, unknown>][],
) {
    const _tests = tests.map((entry) => createCodeBlockProcessorTest(...entry));

    return (params: { codeBlock: ParsedCodeBlock }) => {
        for (const test of _tests) {
            if (test(params)) return true;
        }
        return false;
    };
}
