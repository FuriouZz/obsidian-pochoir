import { moment } from "obsidian";
import type { Extension } from "../environment";

export default function (): Extension {
    return {
        name: "date",
        setup(env) {
            const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
            const api = {
                moment: moment,
                time(format = "HH:mm") {
                    return moment().format(format);
                },
                now(format = DEFAULT_DATE_FORMAT) {
                    return moment().format(format);
                },
                today(format = DEFAULT_DATE_FORMAT) {
                    return moment().format(format);
                },
                tomorrow(format = DEFAULT_DATE_FORMAT) {
                    return moment().add(1, "days").format(format);
                },
                yesterday(format = DEFAULT_DATE_FORMAT) {
                    return moment().add(-1, "days").format(format);
                },
            };

            env.loaders.unshift({
                test: "pochoir:date",
                load: () => api,
            });

            env.contextProviders.push((context) => {
                context.locals.exports.date = api;
            });
        },
    };
}
