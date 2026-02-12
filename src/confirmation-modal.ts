import { type App, Setting } from "obsidian";
import {
    type CustomContent,
    type CustomContentParameters,
    createCustomView,
} from "./custom-view";
import { LOGGER } from "./logger";

export interface ConfirmationParameters<T> extends CustomContentParameters {
    value?: T;
    confirm: () => void;
    cancel: () => void;
}

export interface ConfirmationOptions<T>
    extends CustomContent<ConfirmationParameters<T>> {
    onValidate?: (params: ConfirmationParameters<T>) => boolean;
    onCancel?: (params: ConfirmationParameters<T>) => void;
    onCreateButtons?: (params: ConfirmationParameters<T>) => void;
}

export function promptConfirmation<T>(
    app: App,
    state?: ConfirmationOptions<T>,
) {
    return new Promise<T | undefined>((resolve, reject) => {
        const defaultButtons: Required<
            ConfirmationOptions<T>
        >["onCreateButtons"] = ({ element, confirm, cancel }) => {
            new Setting(element)
                .addButton((btn) => {
                    btn.setButtonText("Validate").setCta().onClick(confirm);
                })
                .addButton((btn) => {
                    btn.setButtonText("Cancel").onClick(cancel);
                });

            element.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault(); // Prevent default form submission behavior
                    confirm();
                }
            });
        };

        const parameters = {
            value: undefined,
        } as ConfirmationParameters<T>;

        let confirmed = false;

        createCustomView(app, {
            viewTitle: "Confirm",
            ...state,
            onOpen(view) {
                view.setTitle("Confirm");

                const validate = state?.onValidate ?? (() => true);
                const createButtons = state?.onCreateButtons ?? defaultButtons;

                Object.assign(parameters, {
                    ...view,

                    confirm: () => {
                        if (validate(parameters)) {
                            confirmed = true;
                            view.close().catch(LOGGER.error);
                        }
                    },

                    cancel() {
                        confirmed = false;
                        view.close().catch(LOGGER.error);
                    },
                });

                state?.onOpen?.(parameters);
                createButtons(parameters);
            },
            onClose(view) {
                state?.onClose?.(parameters);
                view.element.dispatchEvent(
                    new CustomEvent("confirmation:close"),
                );

                if (!confirmed) {
                    try {
                        state?.onCancel?.(parameters);
                    } catch (err) {
                        reject(err as Error);
                    }
                } else {
                    resolve(parameters.value);
                }
            },
        }).then(() => {}, reject);
    });
}

export function promptTextConfirmation(
    app: App,
    state?: ConfirmationOptions<string> & { defaultValue?: string },
) {
    return promptConfirmation<string>(app, {
        ...state,
        onOpen(params) {
            new Setting(params.element).addText((c) => {
                if (state?.defaultValue) c.setValue(state.defaultValue);
                c.onChange((value) => {
                    params.value = value;
                });
            });
        },
    });
}
