import lume from "lume/mod.ts";
import wiki from "./_wiki/mod.ts";

const site = lume();

site.use(wiki());

export default site;
