import {
    highlightInEditingMode,
    hightlightInReadingMode,
} from "./editor/codeBlockHighlighter";
import type { Environment } from "./environment";
import { CodeEditorSuggester } from "./suggesters/code-editor-suggester";
import { createMarkdownRenderer } from "./utils/obsidian";

export class Editor {
    suggester?: CodeEditorSuggester;
    render?: ReturnType<typeof createMarkdownRenderer>;

    constructor(env: Environment) {
        this.enableHighlighterInEditMode(env);
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

    enableHighlighterInEditMode(env: Environment) {
        if (!this.render) this.render = createMarkdownRenderer(env.plugin);
        highlightInEditingMode(env, this.render);
    }

    updateHightlighterInReadingMode(env: Environment) {
        if (!this.render) this.render = createMarkdownRenderer(env.plugin);
        hightlightInReadingMode(env, this.render);
    }

    updateEditorSuggestions(env: Environment) {
        if (!this.suggester) return;
        this.suggester.suggestionByCodeBlock = env.processors.getSuggestions();
    }
}
