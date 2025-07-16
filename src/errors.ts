export interface PochoirErrorOptions extends ErrorOptions {
    verbose?: boolean;
    notice?: boolean;
}

export class PochoirError extends Error {
    verbose: boolean;
    notice: boolean;

    constructor(
        msg: string,
        { verbose = true, notice = true, ...options }: PochoirErrorOptions = {},
    ) {
        super(msg, options);
        this.verbose = verbose;
        this.notice = notice;
    }
}

export class RendererError extends PochoirError {}
