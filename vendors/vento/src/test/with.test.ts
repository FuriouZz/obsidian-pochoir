import "../_dnt.test_polyfills.js";
import * as dntShim from "../_dnt.test_shims.js";
import { test } from "./utils.js";

dntShim.Deno.test({
  name: "Print key variables",
  fn: async () => {
    await test({
      template: `{{ message[key] }}`,
      expected: "It works!",
      data: {
        message: {
          foo: "It works!",
        },
        key: "foo",
      },
    });
  },
});

dntShim.Deno.test({
  name: "Assign key variables",
  fn: async () => {
    await test({
      template: `{{> it["foo"] = "It works!" }}{{ foo }}`,
      expected: "It works!",
    });
    await test({
      template: `{{ set foo = "It works!" }}{{ foo }}`,
      expected: "It works!",
    });
    await test({
      template: `
      {{ function echo(message) }}
        {{ message }}
      {{ /function }}
      {{ set foo = "It works!" }}
      {{ echo(foo) }}
      `,
      expected: "It works!",
    });
  },
});
