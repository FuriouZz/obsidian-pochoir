export const AsyncFunction = async function () {}
	.constructor as FunctionConstructor;

export function createAsyncFunction(content: string, ...parameters: any[]) {
	return new AsyncFunction(...parameters, content);
}
