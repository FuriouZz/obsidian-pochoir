import { type App, ItemView, requestUrl } from "obsidian";
import type { Environment } from "../src/environment";
import createDailyNoteTest from "./create-daily-note.test";

async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        let script = globalThis.document.querySelector<HTMLScriptElement>(
            `script[src="${src}"]`,
        );
        if (script) {
            resolve();
            return;
        }
        script = globalThis.document.createElement("script");
        script.onload = () => resolve();
        script.onerror = reject;
        script.src = src;
        globalThis.document.body.append(script);
    });
}

async function loadStyle(src: string) {
    let style = globalThis.document.querySelector<HTMLStyleElement>(
        `style[data-src="${src}"]`,
    );
    if (style) return;

    style = globalThis.document.createElement("style");
    style.dataset.src = src;

    const response = await requestUrl(src);
    const css = response.text;
    style.setHTMLUnsafe(css);
    globalThis.document.head.append(style);
}

interface TestState {
    test: () => void;
    close: () => void;
}

class TestView extends ItemView {
    static type = "POCHOIR_TEST_VIEW";

    testState?: TestState;

    getViewType(): string {
        return TestView.type;
    }

    getDisplayText(): string {
        return "Test";
    }

    async openTest() {
        if (!this.testState) return;
        const state = this.testState;

        this.contentEl.empty();
        globalThis.document.querySelector("#mocha")?.empty();
        this.contentEl.createEl("div", { attr: { id: "mocha" } });

        mocha.unloadFiles();
        state.test();
        mocha.run();
    }

    async onOpen() {
        return this.openTest();
    }

    async onClose() {
        this.contentEl.dispatchEvent(new CustomEvent("confirmation:close"));
        return Promise.resolve();
    }

    static async create(app: App, test: () => void) {
        // app.workspace.detachLeavesOfType(TestView.type);
        const leaf = app.workspace.getLeaf(false);
        const prevState = leaf.getViewState();
        await leaf.setViewState({ type: TestView.type, active: true });
        await app.workspace.revealLeaf(leaf);

        if (leaf.view instanceof TestView) {
            leaf.view.testState = {
                test,
                close() {
                    leaf.setViewState(prevState);
                },
            } as TestState;
            return leaf.view.openTest();
        }
    }
}

export async function runTests(environment: Environment) {
    if (!Reflect.has(globalThis, "mocha")) {
        const scripts = [
            "https://unpkg.com/mocha/mocha.css",
            "https://unpkg.com/mocha/mocha.js",
            "https://unpkg.com/chai@4/chai.js",
        ];

        for (const src of scripts) {
            if (src.endsWith(".js")) await loadScript(src);
            if (src.endsWith(".css")) await loadStyle(src);
        }

        mocha.setup("bdd");
        mocha.checkLeaks();
    }

    environment.plugin.registerView(
        TestView.type,
        (leaf) => new TestView(leaf),
    );
    TestView.create(environment.app, () => {
        createDailyNoteTest(environment);
    });
}
