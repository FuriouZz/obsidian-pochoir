import { Notice } from "obsidian";
import { PochoirError, RendererError } from "../errors";

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
    let notice = true;
    let verbose = true;
    let prefix = "Pochoir Error";

    if (error instanceof RendererError) {
        prefix = "Pochoir Template Error";
    } else if (error instanceof PochoirError) {
        verbose = error.verbose;
        notice = error.notice;
    }

    if (verbose) globalThis.console.error(error);
    if (notice) {
        alert(error.message, { prefix, ...options });
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
