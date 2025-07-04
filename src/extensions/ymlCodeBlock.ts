import type { Extension } from "../environment";

export default function ymlCodeBlock(): Extension {
  return (env) => {
    const langRegex = /ya?ml/;
    env.codeBlocks.push(async ({ codeBlock, context }) => {
      if (!langRegex.test(codeBlock.language)) return false;
      const result = await env.engine.renderString(
        codeBlock.code,
        context.exports,
      );
      context.globals.$properties.fromYaml(result);
      return true;
    });
  };
}
