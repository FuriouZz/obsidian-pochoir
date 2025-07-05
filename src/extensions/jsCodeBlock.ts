import { createAsyncFunction } from "src/utils";
import type { Extension } from "../environment";

export default function jsCodeBlock(): Extension {
  return (env) => {
    const langRegex = /js|javascript/;
    env.codeBlocks.push(async ({ codeBlock, context }) => {
      if (!langRegex.test(codeBlock.language)) return false;
      const fn = createAsyncFunction(codeBlock.code, "pochoir", "template");
      await fn(context.globals, context.locals);
      return true;
    });
  };
}
