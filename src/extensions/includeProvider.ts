import { findLinkPath } from "src/utils";
import type { Extension } from "../environment";

export default function includeProvider(): Extension {
  return (env) => {
    env.variables.push((context) => {
      const include = async (path: string) => {
        const file = findLinkPath(env.plugin.app, path);
        if (!file) throw new Error(`Cannot find ${path}`);

        const template = env.list.getTemplateByFile(file);
        await template.evaluateCodeBlocks(context, env.codeBlocks);

        return context;
      };

      context.globals.include = include;
    });
  };
}
