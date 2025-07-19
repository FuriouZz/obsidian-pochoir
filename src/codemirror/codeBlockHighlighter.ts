import { syntaxTree } from "@codemirror/language";
import { type EditorState, RangeSetBuilder } from "@codemirror/state";
import { Decoration, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import type { Plugin } from "obsidian";
import { createMarkdownRenderer } from "../utils/obsidian";
import { Environment } from "../environment";

async function highlight({
    builder,
    source,
    start,
    render,
    language,
}: {
    builder: RangeSetBuilder<Decoration>;
    source: string;
    start: number;
    render: (content: string, el?: HTMLElement) => Promise<HTMLElement>;
    language: string;
}) {
    const div = document.createElement("div");
    await render(`\`\`\`${language}\n${source}\n\`\`\``, div);
    const code = div.querySelector("pre > code");
    if (!code) return;
    let currentIndex = start;
    const ranges: [from: number, to: number, className: string][] = [];
    const traverse = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent ?? "";
            currentIndex += text.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const { className } = element;
            const start = currentIndex;
            element.childNodes.forEach((node) => traverse(node));
            const end = currentIndex;
            ranges.push([start, end, className]);
        }
    };

    code.childNodes.forEach((node) => traverse(node));

    ranges.sort((a, b) => a[0] - b[0]);

    for (const [from, to, className] of ranges) {
        builder.add(from, to, Decoration.mark({ class: className }));
    }
}

async function buildDecoration({
    state,
    languages,
    render,
}: {
    state: EditorState;
    languages: Record<string, string>;
    render: (content: string, el?: HTMLElement) => Promise<HTMLElement>;
}) {
    let codeBlockStarted = false;

    let nodeStart = -1;
    let nodeEnd = -1;
    let lang: string | undefined;

    const ranges: [from: number, to: number, language: string][] = [];

    const regex = /pochoir-(\S+)/;
    syntaxTree(state).iterate({
        enter(node) {
            if (
                node.name ===
                "HyperMD-codeblock_HyperMD-codeblock-begin_HyperMD-codeblock-begin-bg_HyperMD-codeblock-bg"
            ) {
                const content = state.sliceDoc(node.from, node.to);
                const match = regex.exec(content);
                if (!match) return;

                lang = match[0];

                if (!codeBlockStarted) {
                    codeBlockStarted = true;
                    return;
                }
            }
            if (
                codeBlockStarted &&
                node.name === "HyperMD-codeblock_HyperMD-codeblock-bg"
            ) {
                if (nodeStart === -1) {
                    nodeStart = node.from;
                }
                nodeEnd = node.to;
                return;
            }

            if (
                node.name ===
                    "HyperMD-codeblock_HyperMD-codeblock-bg_HyperMD-codeblock-end_HyperMD-codeblock-end-bg" &&
                codeBlockStarted &&
                nodeStart > -1 &&
                nodeEnd > -1 &&
                lang
            ) {
                ranges.push([nodeStart, nodeEnd, lang]);
                codeBlockStarted = false;
                nodeStart = -1;
                nodeEnd = -1;
            }
        },
    });

    const builder = new RangeSetBuilder<Decoration>();
    for (const [from, to, language] of ranges) {
        if (language in languages) {
            await highlight({
                source: state.sliceDoc(from, to),
                language: languages[language as keyof typeof languages],
                builder,
                start: from,
                render,
            });
        }
    }

    return builder.finish();
}

function highlighter({
    env,
    render,
}: {
    env: Environment;
    render: (content: string, el?: HTMLElement) => Promise<HTMLElement>;
}) {
    return [
        ViewPlugin.define(
            (view) => {
                let _decorations = Decoration.none;
                const getDecorations = () => _decorations;

                const update = (update: ViewUpdate) => {
                    if (update.viewportChanged || update.docChanged) {
                        _build(update.view.state);
                    }
                };

                const _build = (state: EditorState) => {
                    buildDecoration({
                        state,
                        languages: env.getSupportedCodeBlocks(),
                        render,
                    }).then((decorations) => {
                        _decorations = decorations;
                        view.update([]);
                    });
                };

                _build(view.state);

                return { getDecorations, update };
            },
            {
                decorations: (value) => value.getDecorations(),
            },
        ),
    ];
}

export function codeBlocksHighlighter(plugin: Plugin, env: Environment) {
    const render = createMarkdownRenderer(plugin.app);
    plugin.registerEditorExtension(highlighter({ env, render }));
}
