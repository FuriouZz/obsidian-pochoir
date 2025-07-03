import "../_dnt.polyfills.js";
import { html } from "../deps.js";
export default function () {
    return (env) => {
        // deno-lint-ignore no-explicit-any
        env.filters.escape = (value) => value ? html.escape(value.toString()) : "";
    };
}
