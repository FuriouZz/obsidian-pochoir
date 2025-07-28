import { ShikiTransformer } from "shiki/deps.ts";
import vento from "./vento.grammar.json" with { type: "json" };
import Site from "lume/core/site.ts";
import shiki from "shiki/mod.ts";
import copy from "shiki/plugins/copy/mod.ts";
import attribute from "shiki/plugins/attribute/mod.ts";
import lang from "shiki/plugins/lang/mod.ts";
import css from "shiki/plugins/css/mod.ts";

function codeBlockHighlighter(): ShikiTransformer {
    const aliases = {
        "pochoir-js": "js pochoir",
        "pochoir-javascript": "javascript pochoir",
        "pochoir-command": "yaml command",
        "pochoir-form": "yaml form",
        "pochoir-props": "yaml props",
        "pochoir-properties": "yaml properties",
    };

    return {
        preprocess(source) {
            let src = source;
            for (const [from, to] of Object.entries(aliases)) {
                src = src.replaceAll(from, to);
            }
            return src;
        },
        postprocess(html) {
            let src = html;
            for (const [to, from] of Object.entries(aliases)) {
                src = src.replaceAll(from, to);
            }
            return src;
        },
    };
}

function shikiCopyLang() {
    const scriptPath = import.meta.resolve("./scripts/copy.js");
    return (site: Site) => {
        const path = site.url("scripts/shiki/copy.js");
        site.remoteFile(path, scriptPath);
        site.copy(path);
        site.use(
            attribute({
                attribute: "lang",
                format(content, document) {
                    const button = document.createElement("button");
                    button.setAttribute("class", "copy");
                    button.textContent = content;
                    return button;
                },
                getDefaultValue(el) {
                    const className = el.getAttribute("class");
                    const match = className?.match(/language-(.+)/);
                    if (!match) return;

                    const [, lang] = match;
                    return lang;
                },
            }),
        );
    };
}

export function highlighter() {
    return (site: Site) => {
        site.preprocess([".html"], (pages) => {
            for (const page of pages) {
                const comment = page.document.createComment(" shiki-imports ");
                page.document.head.append(comment);
            }
        });
        site.process([".html"], (pages) => {
            for (const page of pages) {
                const script = page.document.createElement("script");
                script.setAttribute("src", site.url("/scripts/shiki/copy.js"));
                page.document.head.append(script);
            }
        });
        site.use(
            shiki({
                highlighter: {
                    langs: ["javascript", "yaml", "markdown", vento],
                    themes: ["one-light", "github-dark-dimmed"],
                },
                themes: {
                    light: "one-light",
                    dark: "github-dark-dimmed",
                },
                colorAttribute: "data-theme",
                transformers: [codeBlockHighlighter()],
            }),
        );
        site.use(attribute({ attribute: "filename", order: 1 }));
        site.use(shikiCopyLang());
        site.use(css());

        for (const [filename, url] of Object.entries({
            "_includes/css/shiki-extra.css": import.meta.resolve(
                "shiki/plugins/css/styles/main.css",
            ),
        })) {
            site.remoteFile(filename, url);
        }
    };
}
