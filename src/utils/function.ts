export function createAsyncFunction(
    code: string,
    ...parameters: string[]
): (...parameters: unknown[]) => Promise<unknown> {
    const ctor = new Function(`return async function(${parameters}) {
        ${code}
    }`);
    return ctor();
}
