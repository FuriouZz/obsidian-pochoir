import "../_dnt.polyfills.js";
import { html } from "../deps.js";
import type { Environment, Plugin } from "../src/environment.js";

export default function (): Plugin {
  return (env: Environment) => {
    // deno-lint-ignore no-explicit-any
    env.filters.unescape = (value: any) =>
      value ? html.unescape(value.toString()) : "";
  };
}
