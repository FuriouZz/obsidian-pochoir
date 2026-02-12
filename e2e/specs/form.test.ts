import { createField } from "../../src/extensions/form-extension/createField";
import { createFormBuilder } from "../../src/extensions/form-extension/createFormBuilder";
import { TextField } from "../../src/extensions/form-extension/fields";

describe("createForm", () => {
    it("toJSON", async () => {
        const form = createFormBuilder();
        form.text("title").label("Title").initialValue("Untitled");
        expect(form.toJSON()).toEqual({
            title: "Insert template",
            description: "Please fill in the form",
            fields: [
                {
                    label: "Title",
                    type: "text",
                    name: "title",
                    initialValue: "Untitled",
                },
            ],
        });
    });

    it("fromJSON", async () => {
        const title = createField(TextField, { name: "title" })
            .label("Title")
            .initialValue("Untitled");

        const form = createFormBuilder();
        form.fromJSON({
            title: "MyForm",
            description: "MyForm description",
            fields: [title.toJSON()],
        });

        expect(form.toJSON()).toEqual({
            title: "MyForm",
            description: "MyForm description",
            fields: [
                {
                    label: "Title",
                    type: "text",
                    name: "title",
                    initialValue: "Untitled",
                },
            ],
        });
    });
});
