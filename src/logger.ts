export enum LogLevel {
    INFO,
    DEBUG,
    VERBOSE,
}

export const LOG_CONFIG: {
    level: LogLevel;
} = { level: LogLevel.VERBOSE };

export function verbose(...msg: unknown[]) {
    if (LOG_CONFIG.level === LogLevel.VERBOSE) {
        console.log(...msg);
    }
}

export function debug(...msg: unknown[]) {
    if (LOG_CONFIG.level >= LogLevel.DEBUG) console.log(...msg);
}

export function info(...msg: unknown[]) {
    if (LOG_CONFIG.level >= LogLevel.INFO) console.log(...msg);
}
