import { assert, describe, test } from "vitest";
import { createField } from "./createField";
import { createForm } from "./createForm";
import { TextField } from "./fields";

describe("createForm", () => {
    test("toJSON", () => {
        const form = createForm();
        form.text("title").label("Title").initialValue("Untitled");
        assert.deepEqual(form.toJSON(), {
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

    test("fromJSON", () => {
        const title = createField(TextField, { name: "title" })
            .label("Title")
            .initialValue("Untitled");

        const form = createForm();
        form.fromJSON({ fields: [title.toJSON()] });

        assert.deepEqual(form.toJSON(), {
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
