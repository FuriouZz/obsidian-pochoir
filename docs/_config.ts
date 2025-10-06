import lume from "lume/mod.ts";
import wiki from "wiki/mod.ts";
import cssOverrides from "./_config/css-overrides.ts";
import { highlighter } from "./_config/highlighter.ts";

const site = lume({
    location: new URL("https://furiouzz.github.io/obsidian-pochoir/"),
});

site.use(
    wiki({
        favicon: {
            input: "/favicon.png",
        },
    }),
);
site.use(highlighter());
site.use(cssOverrides());
site.preprocess([".md"], (pages) => {
    for (const page of pages) {
        page.data.templateEngine = ["vto", "md"];
    }
});

export default site;
