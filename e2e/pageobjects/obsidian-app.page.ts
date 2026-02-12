import * as fs from "node:fs/promises";
import type { App } from "obsidian";

const TEST_VAULT_DIR = ".e2e_test_vault";
const YOUR_PLUGIN_ID = "pochoir";

class ObsidianApp {
    async removeE2eTestVaultIfExists() {
        // test vault cleanup from previous tests execution
        await fs.rm(TEST_VAULT_DIR, { force: true, recursive: true });
    }

    async createAndOpenFreshVault() {
        await browser.execute((testVaultDir: string) => {
            const { ipcRenderer } = require("electron");
            const shouldCreateNewVault = true;
            // opening clean vault
            ipcRenderer.sendSync(
                "vault-open",
                testVaultDir,
                shouldCreateNewVault,
            );
        }, TEST_VAULT_DIR);

        // copying target plugin for testing
        const targetPluginsDir = `${TEST_VAULT_DIR}/.obsidian/plugins/${YOUR_PLUGIN_ID}/`;
        await fs.mkdir(targetPluginsDir, { recursive: true });
        await fs.copyFile(
            "../manifest.json",
            `${targetPluginsDir}/manifest.json`,
        );
        await fs.copyFile("../main.js", `${targetPluginsDir}/main.js`);

        await this.switchToMainWindow();
        await this.closeModal("Trust vault modal");
    }

    private async switchToMainWindow() {
        await browser.switchWindow("app://obsidian.md/index.html");
    }

    async activateTargetPluginForTesting() {
        await this.activatePlugin(YOUR_PLUGIN_ID);
    }

    private async activatePlugin(pluginId: string) {
        await browser.execute((yourPluginId: string) => {
            // @ts-expect-error 'app' exists in Obsidian
            declare const app: App;
            // enable community plugins
            app.plugins.setEnable(true);
            // enable target plugin for testing
            app.plugins.enablePlugin(yourPluginId);
        }, pluginId);
    }

    // a helper function to close any currently active modal window
    async closeModal(modalName: string) {
        console.log(`Closing '${modalName}'`);
        await $(".modal-close-button").click();
    }

    async createNewNote(content?: string) {
        // click "New note" button
        const newNoteButton = $("aria/New note");
        await newNoteButton.click();

        // focus on note editing area
        const noteContent = $(
            ".workspace-leaf.mod-active .cm-contentContainer",
        );
        await noteContent.click();

        if (content) {
            await browser.execute((content: string) => {
                // @ts-expect-error 'app' exists in Obsidian
                declare const app: App;
                // paste Markdown text newly created note
                app.workspace.activeEditor?.editor?.setValue(content);
            }, content);
        }
    }

    async toggleReadingView() {
        await browser.execute(() => {
            // @ts-expect-error 'app' exists in Obsidian
            declare const app: App;
            // again, using Obsidian command (for similicity and robustness)
            // instead of finding and clicking a button element,
            // our goal is not to test Obsidian itself
            app.commands.executeCommandById("markdown:toggle-preview");
        });
    }

    async getRenderedHtmlFromFirstPararraphOfCurrentNote(): Promise<string> {
        // reading the content of the first paragraph of a rendered note
        return (await $('div.markdown-preview-section p[dir="auto"]').getHTML({
            includeSelectorTag: false,
            prettify: false,
        })) as string;
    }
}

export default new ObsidianApp();
