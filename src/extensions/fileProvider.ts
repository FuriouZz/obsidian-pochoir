import { parseYaml } from "obsidian";
import { FileBuilder } from "src/file";
import type { Extension } from "../environment";

export default function (): Extension {
  return (env) => {
    env.variables.push((context) => {
      // const file = new FileBuilder();
      // file.fromParts({
      //   parent: "{{file.parent}}",
      //   title: "{{file.title}}",
      //   extension: "{{file.extension}}",
      // });
      // context.globals.suggestedPath = file;
    });

    const langRegex = /filename/;
    env.codeBlocks.push(async ({ codeBlock, context }) => {
      if (!langRegex.test(codeBlock.language)) return false;

      const reg = /(\[\[.+\]\])/g;
      const matches = codeBlock.code.matchAll(reg);

      const imports = new Map<string, Record<string, unknown>>();

      let start = 0;
      const ranges: [number, number][] = [];
      const replacements: string[] = [];
      for (const match of matches) {
        ranges.push([start, match.index]);
        start = match.index + match[0].length;

        if (!imports.has(match[0])) {
          const res = await env.importTemplate(match[0], context);
          imports.set(match[0], res);
        }

        replacements.push(`tpl['${match[0]}']`);
      }

      let content = "";
      for (const [index, range] of ranges.entries()) {
        content += codeBlock.code.slice(...range);
        content += replacements[index];
      }

      content += codeBlock.code.slice(start);

      const res = await env.engine.renderString(content, {
        ...context.locals.exports,
        tpl: Object.fromEntries(imports.entries()),
      });
      const yaml = parseYaml(res);
      if (yaml) context.locals.file.compose(yaml);

      return true;
    });
  };
}
