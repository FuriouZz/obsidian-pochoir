import {
    type Editor,
    type EditorPosition,
    EditorSuggest,
    type EditorSuggestContext,
    type EditorSuggestTriggerInfo,
    type TFile,
} from "obsidian";
import type { CodeBlockProcessor } from "../processor-list";

export type CodeEditorSuggestion =
    Required<CodeBlockProcessor>["suggestions"][number];

const CodeBlockLanguageRG = /pochoir-\S+/;
const FencedCodeBlockRG = /^(`|~){3,}/;
const VariableRG = /\{[\d\w-_]+\}/;

export class CodeEditorSuggester extends EditorSuggest<CodeEditorSuggestion> {
    selectedRange?: EditorSuggestTriggerInfo & { language: string };
    suggestionByCodeBlock: Record<string, CodeEditorSuggestion[]> = {};

    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile | null,
    ): EditorSuggestTriggerInfo | null {
        if (!file) return null;

        const language = this.getCodeBlockLanguage(cursor, editor);
        if (!language) return null;

        const line = editor.getRange(
            { line: cursor.line, ch: 0 },
            { line: cursor.line, ch: cursor.ch },
        );

        const selectedRange = {
            start: {
                line: cursor.line,
                ch: 0,
            },
            end: {
                line: cursor.line,
                ch: editor.getLine(cursor.line).length,
            },
            query: line,
            language,
        };

        const wordRange = editor.wordAt(cursor);
        if (wordRange) {
            const word = editor.getRange(wordRange.from, wordRange.to);
            selectedRange.start = wordRange.from;
            selectedRange.end = wordRange.to;
            selectedRange.query = word;
        }

        this.selectedRange = selectedRange;

        return selectedRange;
    }

    getSuggestions(
        context: EditorSuggestContext,
    ): CodeEditorSuggestion[] | Promise<CodeEditorSuggestion[]> {
        if (!this.selectedRange) return [];

        const line = context.query;
        const language = this.selectedRange?.language;

        const suggestions = this.getSuggestionsFromLanguage(language, line);
        console.log(suggestions);
        return suggestions;
    }

    getSuggestionsFromLanguage(language: string, line: string) {
        const suggestions = this.suggestionByCodeBlock[language] ?? [];
        if (!line) return suggestions;
        return suggestions.filter((c) => {
            const trigger = c.trigger ?? c.suggestion;
            return trigger.startsWith(line) && trigger !== line;
        });
    }

    renderSuggestion(value: CodeEditorSuggestion, el: HTMLElement): void {
        el.setText(value.display ?? value.suggestion);
    }

    selectSuggestion(
        suggestion: CodeEditorSuggestion,
        _evt: MouseEvent | KeyboardEvent,
    ): void {
        if (!this.selectedRange || !this.context) return;

        const value = suggestion.suggestion;
        const editor = this.context.editor;
        editor.replaceRange(
            value,
            this.selectedRange.start,
            this.selectedRange.end,
        );

        const line = editor.getLine(this.selectedRange.start.line);
        const match = line.match(VariableRG);

        // Select variable
        if (typeof match?.index === "number") {
            const offset = match.index;
            editor.setSelection(
                {
                    line: this.selectedRange.end.line,
                    ch: offset,
                },
                {
                    line: this.selectedRange.end.line,
                    ch: offset + match[0].length,
                },
            );
        }

        // Set cursor at the end of line
        else {
            editor.setCursor({
                line: this.selectedRange.end.line,
                ch: this.selectedRange.start.ch + line.length,
            });
        }
    }

    getCodeBlockLanguage(cursor: EditorPosition, editor: Editor) {
        let start = -1;
        let end = -1;
        let offset = -1;
        let line: string;

        const count = editor.lineCount();
        let matchCount = 0;

        while (matchCount < 2 && offset < count) {
            offset++;

            if (start === -1) {
                start = cursor.line - offset;
                line = editor.getLine(start);
                if (!FencedCodeBlockRG.test(line)) {
                    if (start === 0) break;
                    start = -1;
                } else {
                    matchCount++;
                }
            }

            if (end === -1) {
                end = cursor.line + offset;
                line = editor.getLine(end);
                if (!FencedCodeBlockRG.test(line)) {
                    if (end === count - 1) break;
                    end = -1;
                } else {
                    matchCount++;
                }
            }
        }

        if (matchCount === 2) {
            const match = editor.getLine(start).match(CodeBlockLanguageRG);
            return match?.[0];
        }

        return null;
    }
}
