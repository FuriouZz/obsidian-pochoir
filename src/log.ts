import { Notice } from "obsidian";

export function log(
  message: string,
  { duration, prefix = "Pochoir" }: { duration?: number; prefix?: string } = {},
) {
  const n = new Notice("", duration);
  n.messageEl.createEl("b", { text: prefix });
  n.messageEl.createEl("span", { text: ":" });
  n.messageEl.createEl("br");
  n.messageEl.createEl("span", { text: message });
}

export function logError(error: Error, options?: { duration?: number }) {
  if (error.message.startsWith("Error in template")) {
    const cause = error.cause as Error;
    log(cause.message, { prefix: "Pochoir Template Error", ...options });
  } else {
    console.error(error);
    log(error.message, { prefix: "Pochoir Error", ...options });
  }
}
