import tmpl from "../mod.js";
import { assertEquals } from "../deps/deno.land/std@0.224.0/assert/assert_equals.js";
import { assertThrows } from "../deps/deno.land/std@0.224.0/assert/assert_throws.js";
import { extract } from "../deps/deno.land/std@0.224.0/front_matter/yaml.js";
import { test as fmTest } from "../deps/deno.land/std@0.224.0/front_matter/mod.js";
import { path } from "../deps.js";
export function testThrows(options) {
    assertThrows(() => testSync(options));
}
export async function test(options) {
    const env = tmpl({
        includes: new FileLoader(options.includes || {}),
        ...options.options,
    });
    if (options.init) {
        options.init(env);
    }
    if (options.filters) {
        for (const [name, filter] of Object.entries(options.filters)) {
            env.filters[name] = filter;
        }
    }
    const result = await env.runString(options.template, options.data);
    assertEquals(result.content.trim(), options.expected.trim());
}
export function testSync(options) {
    const env = tmpl({
        ...options.options,
    });
    if (options.init) {
        options.init(env);
    }
    if (options.filters) {
        for (const [name, filter] of Object.entries(options.filters)) {
            env.filters[name] = filter;
        }
    }
    const result = env.runStringSync(options.template, options.data);
    assertEquals(result.content.trim(), options.expected.trim());
}
export class FileLoader {
    files = {};
    constructor(files) {
        this.files = files;
    }
    load(file) {
        const source = this.files[file] || "";
        if (fmTest(source, ["yaml"])) {
            const { body, attrs } = extract(source);
            return {
                source: body,
                data: attrs,
            };
        }
        return { source };
    }
    resolve(from, file) {
        if (file.startsWith(".")) {
            return path.join(path.dirname(from), file).replace(/\\/g, "/");
        }
        return path.join("/", file).replace(/\\/g, "/");
    }
}
