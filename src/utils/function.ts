type Fn<T> = () => (...parameters: unknown[]) => Promise<T>;

export function createAsyncFunction<T = unknown>(
    code: string,
    ...parameters: string[]
) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const ctor = new Function(`return async function(${parameters.join(",")}) {
        ${code}
    }`) as Fn<T>;
    return ctor();
}
