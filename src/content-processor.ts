class Content {
    #content: string = "";

    constructor(content: string) {
        this.#content = content;
    }

    get() {
        return this.#content;
    }

    lines() {
        return this.#content.split("\n");
    }

    transformByLine(
        cb: (line: string, index: number) => string | string[] | false,
    ) {
        return this.lines()
            .map((line, index) => {
                const result = cb(line, index);
                if (result === false) return false;
                return Array.isArray(result) ? result.join("\n") : result;
            })
            .filter((line) => line !== false)
            .join("\n");
    }

    update(content: string) {
        this.#content = content;
    }
}

export class ContentProcessor {
    targetProcessor: ((params: { content: Content }) => void)[] = [];
    templateProcessor: ((params: { content: Content }) => void)[] = [];

    processTarget(content: string) {
        const c = new Content(content);
        for (const processor of this.targetProcessor) {
            processor({ content: c });
            content = c.get();
        }
        return content;
    }

    processTemplate(content: string) {
        const c = new Content(content);
        for (const processor of this.templateProcessor) {
            processor({ content: c });
            content = c.get();
        }
        return content;
    }
}
