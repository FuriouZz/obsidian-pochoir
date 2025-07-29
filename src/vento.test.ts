import { FileLoader } from "ventojs/src/loader.js";
import { assert, test } from "vitest";
import { vento } from "./vento";

test("autoTrim", () => {
    const renderer = vento({ loader: new FileLoader() });
    const render = (src: string, data: Record<string, unknown>) => {
        return renderer.runStringSync(src, data).content;
    };

    const data = { title: "Hello World", author: "John Doe" };
    const expected = "# Hello World\n\nJohn Doe";

    const res0 = render("# {{data.title}}\n\n{{data.author}}", { data });
    assert.equal(res0, expected);

    const res2 = render("# {{form.title}}\n\n{{form.author}}", { form: data });
    assert.equal(res2, expected);
});
