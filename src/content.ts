import type { Template } from "./template";

export class Content {
    processors: ((content: string) => string)[] = [];

    addProcessor(callback: (content: string) => string) {
        this.processors.push(callback);
    }

    render(template: Template) {
        const { source } = template.info;
        const content = template.info.contentRanges
            .map((range) => source.slice(...range))
            .join("")
            .trim();
        return this.processors.reduce(
            (content, callback) => callback(content),
            content,
        );
    }
}
