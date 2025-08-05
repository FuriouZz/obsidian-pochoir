import { codeBlocksHighlighter } from "./editor/codeBlockHighlighter";
import type { Environment } from "./environment";
import { CodeEditorSuggester } from "./suggesters/code-editor-suggester";

export class Editor {
    suggester?: CodeEditorSuggester;

    constructor(env: Environment) {
        this.enableHighlighter(env);
        this.enableEditorSuggest(env);
    }

    enableEditorSuggest(env: Environment) {
        this.suggester = new CodeEditorSuggester(env.app);
        this.updateEditorSuggestions(env);
        env.plugin.registerEditorSuggest(this.suggester);
        env.plugin.register(
            env.cache.events.on((e) => {
                if (e.name === "queue-cleared") {
                    this.updateEditorSuggestions(env);
                }
            }),
        );
    }

    enableHighlighter(env: Environment) {
        codeBlocksHighlighter(env, {
            getSupportedCodeBlocks: () => {
                const l = env.preprocessors.getSupportedCodeBlock();
                env.processors.getSupportedCodeBlock(l);
                return l;
            },
        });
    }

    updateEditorSuggestions(env: Environment) {
        if (!this.suggester) return;
        const l = env.preprocessors.getSuggestions();
        env.processors.getSuggestions(l);
        this.suggester.suggestionByCodeBlock = l;
    }
}
