import { type App, type EditorSelectionOrCaret, MarkdownView } from "obsidian";

const CursorRegex = new RegExp(/\{\^(\d*)\}/);

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

    parse() {
        const view = this.getView();
        if (!view) return;

        this.cursors.length = 0;

        const cursors: Record<string, EditorSelectionOrCaret[]> = {};

        for (let i = 0; i < view.editor.lineCount(); i++) {
            const line = view.editor.getLine(i);
            const match = line.match(CursorRegex);
            if (!match) continue;
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
