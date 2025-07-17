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
    if (L[level] >= L.VERBOSE) log(...msg);
}

export function debug(...msg: unknown[]) {
    if (L[level] >= L.DEBUG) log(...msg);
}

export function info(...msg: unknown[]) {
    if (L[level] >= L.INFO) log(...msg);
}

function log(...msg: unknown[]) {
    console.log(`${level}:`, ...msg);
}

export function getLogger() {
    return {
        get level() {
            return getLogLevel();
        },
        set level(value: Level) {
            setLogLevel(value);
        },
        verbose,
        debug,
        info,
    };
}
