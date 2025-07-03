import type { Options } from "../mod.js";
import type { Environment, Filter } from "../src/environment.js";
import type { Loader } from "../src/loader.node.js";
export interface TestOptions {
    template: string;
    data?: Record<string, unknown>;
    filters?: Record<string, Filter>;
    expected: string;
    init?: (env: Environment) => void;
    includes?: Record<string, string>;
    options?: Options;
}
export declare function testThrows(options: TestOptions): void;
export declare function test(options: TestOptions): Promise<void>;
export declare function testSync(options: TestOptions): void;
export declare class FileLoader implements Loader {
    files: Record<string, string>;
    constructor(files: Record<string, string>);
    load(file: string): {
        source: string;
        data: Record<string, unknown>;
    } | {
        source: string;
        data?: undefined;
    };
    resolve(from: string, file: string): string;
}
//# sourceMappingURL=utils.d.ts.map