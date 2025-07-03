import "../_dnt.test_polyfills.js";
import * as dntShim from "../_dnt.test_shims.js";
import { test } from "./utils.js";
dntShim.Deno.test("Strings with dangerous characters", async () => {
    await test({
        template: "<h1>Test</h1><script>let name = 'Gandalf'; console.log(`Hi ${name}.`);</script>",
        expected: "<h1>Test</h1><script>let name = 'Gandalf'; console.log(`Hi ${name}.`);</script>",
    });
    await test({
        template: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
        expected: '<h1>Test</h1><script>let name = "Gandalf"; console.log(`Hi ${name}.`);</script>',
    });
    await test({
        template: '<h1>Test</h1><script>let name = "Gandalf"; console.log(\`Hi ${name}.\`);</script>',
        expected: '<h1>Test</h1><script>let name = "Gandalf"; console.log(\`Hi ${name}.\`);</script>',
    });
    await test({
        template: "\\`",
        expected: "\\`",
    });
});
dntShim.Deno.test("Empty string", async () => {
    await test({
        template: "",
        expected: "",
    });
    await test({
        template: "{{> /* empty */}}",
        expected: "",
    });
    await test({
        template: "{{# empty #}}",
        expected: "",
    });
});
