import lume from "lume/mod.ts";
import wiki from "wiki/mod.ts";
import { highlighter } from "./_config/highlighter.ts";
import cssOverrides from "./_config/css-overrides.ts";

const site = lume({
    location: new URL("https://furiouzz.github.io/obsidian-pochoir/"),
});

site.use(wiki());
site.use(highlighter());
site.use(cssOverrides());

export default site;
