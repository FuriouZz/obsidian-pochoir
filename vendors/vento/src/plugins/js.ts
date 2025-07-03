import "../_dnt.polyfills.js";
import type { Environment, Plugin } from "../src/environment.js";

export default function (): Plugin {
  return (env: Environment) => {
    env.tags.push(jsTag);
  };
}

function jsTag(
  _env: Environment,
  code: string,
): string | undefined {
  if (!code.startsWith(">")) {
    return;
  }

  return code.replace(/^>\s+/, "");
}
