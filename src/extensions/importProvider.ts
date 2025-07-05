import { findLinkPath } from "src/utils";
import type { Extension } from "../environment";

export default function importProvider(): Extension {
  return (env) => {
    env.variables.push((context) => {
      const importTemplate = async (path: string) => {
        const file = findLinkPath(env.plugin.app, path);
        if (!file) throw new Error(`Cannot find ${path}`);

        const ctx = env.createContext();
        ctx.globals = context.globals;
        const template = env.list.getTemplateByFile(file);
        await template.evaluateCodeBlocks(ctx, env.codeBlocks);
        await template.evaluateProperties(ctx, env.engine);

        return ctx.locals.exports;
      };

      context.globals.import = importTemplate;
    });
  };
}
