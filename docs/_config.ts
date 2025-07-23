import lume from "lume/mod.ts";
import wiki from "./_wiki/mod.ts";

const site = lume({
    location: new URL("https://furiouzz.github.io/obsidian-pochoir/"),
});

site.use(wiki());

export default site;
