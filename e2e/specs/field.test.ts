import { createField } from "../../src/extensions/form-extension/createField";
import {
    DropdownField,
    TextField,
} from "../../src/extensions/form-extension/fields";

describe("createField", () => {
    it("TextField", () => {
        const field = createField(TextField, {
            name: "name",
        })
            .label("Title")
            .name("title")
            .initialValue("Untitled");

        expect(field.toJSON()).toEqual({
            label: "Title",
            name: "title",
            type: "text",
            initialValue: "Untitled",
        });
    });

    it("DropdownField", () => {
        const field = createField(DropdownField, {
            name: "name",
        })
            .label("Pronoms")
            .name("pronoms")
            .initialValue("they")
            .options({ they: "They", she: "She", he: "He" });

        expect(field.toJSON()).toEqual({
            label: "Pronoms",
            name: "pronoms",
            type: "dropdown",
            initialValue: "they",
            options: { they: "They", she: "She", he: "He" },
        });
    });
});
