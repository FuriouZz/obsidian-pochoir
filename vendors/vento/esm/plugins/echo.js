import "../_dnt.polyfills.js";
export default function () {
    return (env) => {
        env.tags.push(echoTag);
    };
}
function echoTag(env, code, output, tokens) {
    if (!code.startsWith("echo ")) {
        return;
    }
    const value = code.replace(/^echo\s+/, "");
    const val = env.compileFilters(tokens, value, env.options.autoescape);
    return `${output} += ${val};`;
}
