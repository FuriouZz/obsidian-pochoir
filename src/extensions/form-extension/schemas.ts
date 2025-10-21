import { moment } from "obsidian";
import * as v from "valibot";

export function checkMomentDate(
    format = "YYYY-MM-DD hh:mm:ss",
    message = "Invalid date",
): v.BaseValidation<string, string, v.BaseIssue<string>> {
    return v.rawCheck(({ dataset, addIssue }) => {
        const val = dataset.value;
        const isValid =
            typeof val === "string" && moment(val, format, true).isValid();

        if (!isValid) {
            addIssue({
                expected: format,
                received: String(val),
                input: val,
                message,
            });
        }
    });
}
