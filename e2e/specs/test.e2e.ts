import { browser } from "@wdio/globals";
import ObsidianApp from "../pageobjects/obsidian-app.page";

describe("Electron Testing", () => {
    it("should print application title", async () => {
        console.log("Hello", await browser.getTitle(), "application!");
    });
});

describe("Obsidian note", () => {
    it("should render bold text with <strong> HTML tag", async () => {
        await ObsidianApp.createNewNote("Hello **world**!");
        await ObsidianApp.toggleReadingView();

        const html =
            await ObsidianApp.getRenderedHtmlFromFirstPararraphOfCurrentNote();
        expect(html).toBe("Hello <strong>world</strong>!");
    });
});
