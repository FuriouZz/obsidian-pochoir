import { Notice } from "obsidian";
import { ParserError, RendererError } from "../errors";

export function alert(
    message: string,
    {
        duration,
        prefix = "Pochoir",
    }: { duration?: number; prefix?: string } = {},
) {
    const n = new Notice("", duration);
    n.messageEl.createEl("b", { text: prefix });
    n.messageEl.createEl("span", { text: ":" });
    n.messageEl.createEl("br");
    n.messageEl.createEl("span", { text: message });
}

export function alertError(error: Error, options?: { duration?: number }) {
    if (error instanceof RendererError) {
        alert(error.message, { prefix: "Pochoir Template Error", ...options });
    } else if (error instanceof ParserError) {
        console.error(error);
        // alert(error.message, { prefix: "Pochoir Error", ...options });
    } else {
        console.error(error);
        alert(error.message, { prefix: "Pochoir Error", ...options });
    }
}

export async function alertWrap<T>(cb: () => T, cleanup?: () => void) {
    try {
        return await cb();
    } catch (e) {
        alertError(e as Error);
        cleanup?.();
    }
}
