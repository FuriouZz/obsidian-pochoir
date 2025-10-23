import { FileLoader } from "ventojs/loaders/file.js";
import { assert, test } from "vitest";
import { vento } from "./vento";

test("autoTrim", async () => {
    const renderer = vento({ loader: new FileLoader() });
    const render = async (src: string, data: Record<string, unknown>) => {
        const res = await renderer.runString(src, data);
        return res.content;
    };

    const data = { title: "Hello World", author: "John Doe" };
    const expected = "# Hello World\n\nJohn Doe";

    const res0 = await render("# {{data.title}}\n\n{{data.author}}", { data });
    assert.equal(res0, expected);

    const res2 = await render("# {{form.title}}\n\n{{form.author}}", {
        form: data,
    });
    assert.equal(res2, expected);
});
