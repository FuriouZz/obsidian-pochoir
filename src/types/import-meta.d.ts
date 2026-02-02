declare interface ImportMetaEnv {
    MODE: string;
    PROD: boolean;
    DEV: boolean;
    TEST: boolean;
}

declare interface ImportMeta {
    readonly env: ImportMetaEnv;
}
