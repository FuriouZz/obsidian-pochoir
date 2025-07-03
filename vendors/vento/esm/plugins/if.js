import "../_dnt.polyfills.js";
export default function () {
    return (env) => {
        env.tags.push(ifTag);
        env.tags.push(elseTag);
    };
}
function ifTag(env, code, output, tokens) {
    if (!code.startsWith("if ")) {
        return;
    }
    const condition = code.replace(/^if\s+/, "").trim();
    const compiled = [];
    const val = env.compileFilters(tokens, condition);
    compiled.push(`if (${val}) {`);
    compiled.push(...env.compileTokens(tokens, output, ["/if"]));
    tokens.shift();
    compiled.push("}");
    return compiled.join("\n");
}
function elseTag(_env, code) {
    if (!code.startsWith("else ") && code !== "else") {
        return;
    }
    const match = code.match(/^else(\s+if\s+(.*))?$/);
    if (!match) {
        throw new Error(`Invalid else: ${code}`);
    }
    const [_, ifTag, condition] = match;
    if (ifTag) {
        return `} else if (${condition}) {`;
    }
    return "} else {";
}
