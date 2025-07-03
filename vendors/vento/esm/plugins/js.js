import "../_dnt.polyfills.js";
export default function () {
    return (env) => {
        env.tags.push(jsTag);
    };
}
function jsTag(_env, code) {
    if (!code.startsWith(">")) {
        return;
    }
    return code.replace(/^>\s+/, "");
}
