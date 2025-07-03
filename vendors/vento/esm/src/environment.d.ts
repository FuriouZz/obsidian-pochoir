import "../_dnt.polyfills.js";
import { Token } from "./tokenizer.js";
export interface TemplateResult {
    content: string;
    [key: string]: unknown;
}
export interface Template {
    (data?: Record<string, unknown>): Promise<TemplateResult>;
    source: string;
    code: string;
    file?: string;
}
export interface TemplateSync {
    (data?: Record<string, unknown>): TemplateResult;
    source: string;
    code: string;
    file?: string;
}
export type TokenPreprocessor = (env: Environment, tokens: Token[], path?: string) => Token[] | void;
export type Tag = (env: Environment, code: string, output: string, tokens: Token[]) => string | undefined;
export type FilterThis = {
    data: Record<string, unknown>;
    env: Environment;
};
export type Filter = (this: FilterThis, ...args: any[]) => any;
export type Plugin = (env: Environment) => void;
export interface TemplateSource {
    source: string;
    data?: Record<string, unknown>;
}
export interface Loader {
    load(file: string): TemplateSource | Promise<TemplateSource>;
    resolve(from: string, file: string): string;
}
export interface Options {
    loader: Loader;
    dataVarname: string;
    autoescape: boolean;
    autoDataVarname: boolean;
}
export declare class Environment {
    cache: Map<string, Template>;
    options: Options;
    tags: Tag[];
    tokenPreprocessors: TokenPreprocessor[];
    filters: Record<string, Filter>;
    utils: Record<string, unknown>;
    constructor(options: Options);
    use(plugin: Plugin): void;
    run(file: string, data: Record<string, unknown>, from?: string): Promise<TemplateResult>;
    runString(source: string, data?: Record<string, unknown>, file?: string): Promise<TemplateResult>;
    runStringSync(source: string, data?: Record<string, unknown>): TemplateResult;
    compile(source: string, path?: string, defaults?: Record<string, unknown>, sync?: false): Template;
    compile(source: string, path?: string, defaults?: Record<string, unknown>, sync?: true): TemplateSync;
    tokenize(source: string, path?: string): Token[];
    load(file: string, from?: string): Promise<Template>;
    compileTokens(tokens: Token[], outputVar?: string, stopAt?: string[]): string[];
    compileFilters(tokens: Token[], output: string, autoescape?: boolean): string;
}
//# sourceMappingURL=environment.d.ts.map