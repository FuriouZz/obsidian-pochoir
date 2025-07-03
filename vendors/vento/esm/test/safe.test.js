import "../_dnt.test_polyfills.js";
import * as dntShim from "../_dnt.test_shims.js";
import { test, testSync } from "./utils.js";
dntShim.Deno.test("Safe filter does not transform input", async () => {
    await test({
        template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
        expected: "<h1>Hello world&lt;/h1&gt;",
    });
    testSync({
        template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
        expected: "<h1>Hello world&lt;/h1&gt;",
    });
});
dntShim.Deno.test("Safe filter overrides autoescaping", async () => {
    await test({
        options: {
            autoescape: true,
        },
        template: `
    {{ "<h1>Hello world&lt;/h1&gt;" |> safe }}
    `,
        expected: "<h1>Hello world&lt;/h1&gt;",
    });
    testSync({
        options: {
            autoescape: true,
        },
        template: `
    {{ "<h1>Hello world</h1>" |> safe }}
    `,
        expected: "<h1>Hello world</h1>",
    });
});
