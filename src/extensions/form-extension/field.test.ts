import { assert, describe, test } from "vitest";
import { createField } from "./createField";
import { DropdownField, TextField } from "./fields";

describe("createField", () => {
    test("TextField", () => {
        const field = createField(TextField, {
            name: "name",
        })
            .label("Title")
            .name("title")
            .initialValue("Untitled");

        assert.deepEqual(field.toJSON(), {
            label: "Title",
            name: "title",
            type: "text",
            initialValue: "Untitled",
        });
    });

    test("DropdownField", () => {
        const field = createField(DropdownField, {
            name: "name",
        })
            .label("Pronoms")
            .name("pronoms")
            .initialValue("they")
            .options({ they: "They", she: "She", he: "He" });

        assert.deepEqual(field.toJSON(), {
            label: "Pronoms",
            name: "pronoms",
            type: "dropdown",
            initialValue: "they",
            options: { they: "They", she: "She", he: "He" },
        });
    });
});
