import "../_dnt.polyfills.js";
export default function () {
    return (env) => {
        env.tags.push(layoutTag);
    };
}
function layoutTag(env, code, output, tokens) {
    if (!code.startsWith("layout ")) {
        return;
    }
    const match = code?.match(/^layout\s+([^{]+|`[^`]+`)+(?:\{([\s|\S]*)\})?$/);
    if (!match) {
        throw new Error(`Invalid wrap: ${code}`);
    }
    const [_, file, data] = match;
    const varname = output.startsWith("__layout")
        ? output + "_layout"
        : "__layout";
    const compiled = [];
    const compiledFilters = env.compileFilters(tokens, varname);
    compiled.push("{");
    compiled.push(`let ${varname} = "";`);
    compiled.push(...env.compileTokens(tokens, varname, ["/layout"]));
    if (tokens.length && (tokens[0][0] !== "tag" || tokens[0][1] !== "/layout")) {
        throw new Error(`Missing closing tag for layout tag: ${code}`);
    }
    tokens.shift();
    compiled.push(`${varname} = ${compiledFilters};`);
    const { dataVarname } = env.options;
    compiled.push(`const __tmp = await __env.run(${file},
      {...${dataVarname}${data ? `, ${data}` : ""}, content: ${env.compileFilters(tokens, varname)}},
      __file
    );
    ${output} += __tmp.content;`);
    compiled.push("}");
    return compiled.join("\n");
}
