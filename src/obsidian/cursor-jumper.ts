import { type App, type EditorSelectionOrCaret, MarkdownView } from "obsidian";

const CursorRegex = /\{\^(\d*)\}/g;

// BUG with String.prototype.matchAll()
// fallback to RegExp.exec()
function* matchAll(source: string, regex: RegExp) {
    let match: RegExpExecArray | null = regex.exec(source);
    while (match) {
        yield match;
        match = regex.exec(source);
    }
}

export class CursorJumper {
    cursors: EditorSelectionOrCaret[][];
    app: App;

    constructor(app: App) {
        this.app = app;
        this.cursors = [];
    }

    getView() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.getMode() !== "preview") {
            return view;
        }
        return null;
    }

    hasCursors(content: string) {
        return CursorRegex.test(content);
    }

    parse() {
        const view = this.getView();
        if (!view) return;

        this.cursors.length = 0;

        const cursors: Record<string, EditorSelectionOrCaret[]> = {};

        for (let i = 0; i < view.editor.lineCount(); i++) {
            const line = view.editor.getLine(i);
            for (const match of matchAll(line, CursorRegex)) {
                const ch = match.index ?? 0;
                const pattern = match[0];

                const order = match[1] ? match[1] : "0";

                if (!(order in cursors)) {
                    cursors[order] = [];
                }

                cursors[order].push({
                    anchor: { ch, line: i },
                    head: { ch: ch + pattern.length, line: i },
                });
            }
        }

        this.cursors = Object.keys(cursors)
            .sort()
            .map((key) => cursors[key]);
    }

    jump() {
        const view = this.getView();
        if (!view) return;

        const cursors = this.cursors.shift();
        if (!cursors) return;

        view.editor.transaction({
            selections: cursors.map((s) => ({
                from: s.anchor,
                // to: s.head,
            })),
            changes: cursors.map((s) => ({
                from: s.anchor,
                to: s.head,
                text: "",
            })),
        });
    }
}
