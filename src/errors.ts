export interface PochoirErrorOptions extends ErrorOptions {
    verbose?: boolean;
    notice?: boolean;
    prefix?: string;
}

export class PochoirError extends Error {
    verbose: boolean;
    notice: boolean;
    prefix: string;

    constructor(
        msg: string,
        {
            verbose = true,
            notice = true,
            prefix = "Pochoir Error",
            ...options
        }: PochoirErrorOptions = {},
    ) {
        super(msg, options);
        this.verbose = verbose;
        this.notice = notice;
        this.prefix = prefix;
    }
}

export class RendererError extends PochoirError {}
