const L = {
    INFO: 0,
    DEBUG: 10,
    VERBOSE: 20,
};

type Level = keyof typeof L;

let level: Level = "VERBOSE";

export function getLogLevel() {
    return level;
}

export function setLogLevel(value: Level) {
    level = value;
}

export function verbose(...msg: unknown[]) {
    if (L[level] >= L.VERBOSE) log("info", ...msg);
}

export function debug(...msg: unknown[]) {
    if (L[level] >= L.DEBUG) log("info", ...msg);
}

export function info(...msg: unknown[]) {
    if (L[level] >= L.INFO) log("info", ...msg);
}

export function error(...msg: unknown[]) {
    if (L[level] >= L.INFO) log("error", ...msg);
}

function log(type: "info" | "error", ...msg: unknown[]) {
    globalThis.console[type](`${level}:`, ...msg);
}

export const LOGGER = {
    get level() {
        return getLogLevel();
    },
    set level(value: Level) {
        setLogLevel(value);
    },
    verbose,
    debug,
    info,
    error,
};
