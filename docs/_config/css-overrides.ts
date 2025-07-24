import Site from "lume/core/site.ts";

export default function cssOverrides() {
    return (site: Site) => {
        for (const [filename, url] of Object.entries({
            "_includes/wiki/src/styles.css": import.meta.resolve(
                "wiki/src/styles.css",
            ),
            "styles.css": import.meta.resolve("../_includes/styles.css"),
        })) {
            site.remoteFile(filename, url);
        }
    };
}
