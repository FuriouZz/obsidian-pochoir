import { Platform } from "obsidian";
import type { InferOutput } from "valibot";
import type { Environment, Extension } from "../environment";
import type { TemplateContext } from "../template";
import { tryParseYaml } from "../utils/obsidian";
import {
    createFormBuilder,
    type FormBuilder,
} from "./form-extension/createFormBuilder";
import type { TextField } from "./form-extension/fields";
import { promptForm } from "./form-extension/obsidian";

export default function (): Extension {
    return {
        name: "form",
        settings: {
            label: "Enable [pochoir-form](https://furiouzz.github.io/obsidian-pochoir/form/overview/) code block",
            desc: "Fill your template from a modal form",
        },
        setup(env) {
            const formContext = new FormContext(env);

            env.loaders.push({
                contextMode: "shared",
                test: "pochoir:form",
                load: async (_, ctx) => formContext.createAPI(ctx),
            });

            env.processors.set("codeblock:form", {
                type: "codeblock",
                languages: { "pochoir-form": "yaml" },
                order: 40,
                async process({ codeBlock, context }) {
                    const { name, exports, target } = codeBlock.attributes;

                    const form = formContext.createForm(
                        context,
                        typeof name === "string" ? name : undefined,
                    );
                    const obj = tryParseYaml<
                        Record<string, InferOutput<typeof TextField>>
                    >(codeBlock.code.replace(/\t/g, " "));

                    if (obj) {
                        const fields = Object.entries(obj).map(
                            ([name, field]) => ({ ...field, name }),
                        );
                        form.fromJSON({ title: "", description: "", fields });
                    }

                    if (typeof exports === "string") {
                        context.locals.exports[exports] =
                            await formContext.prompt(
                                form,
                                typeof target === "string" &&
                                    /modal|view/.test(target)
                                    ? (target as "view")
                                    : undefined,
                            );
                    }
                },
            });
        },
    };
}

class FormContext {
    env: Environment;
    forms = new WeakMap<TemplateContext, Map<string, FormBuilder>>();

    constructor(env: Environment) {
        this.env = env;
    }

    get app() {
        return this.env.app;
    }

    getFormMap(ctx: TemplateContext) {
        let forms = this.forms.get(ctx);
        if (!forms) {
            forms = new Map<string, FormBuilder>();
            this.forms.set(ctx, forms);
        }
        return forms;
    }

    createForm(ctx: TemplateContext, name?: string) {
        const forms = this.getFormMap(ctx);
        const _name = name ?? `form${forms.size}`;
        let form = forms.get(_name);
        if (!form) {
            form = createFormBuilder();
            forms.set(_name, form);
        }
        return form;
    }

    createAPI(ctx: TemplateContext) {
        return {
            getForms: () => {
                return this.getFormMap(ctx);
            },
            get: (name: string) => {
                return this.getFormMap(ctx).get(name);
            },
            create: (name?: string) => {
                return this.createForm(ctx, name);
            },
            prompt: (name: string | FormBuilder, target?: "modal" | "view") => {
                let form: FormBuilder | undefined;
                if (typeof name === "string") {
                    form = this.getFormMap(ctx).get(name);
                } else {
                    form = name;
                }
                if (form) return this.prompt(form, target);
                return {};
            },
        };
    }

    prompt(
        form: FormBuilder,
        target: "modal" | "view" = Platform.isDesktop ? "modal" : "view",
    ) {
        return new Promise<Record<string, unknown>>((resolve, reject) => {
            promptForm(
                this.app,
                {
                    form: form.toJSON(),
                    done: resolve,
                    cancel: () => {
                        this.env.abortTemplate(reject);
                    },
                },
                target,
            );
        });
    }
}
