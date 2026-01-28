declare global {
    interface ImportMetaEnv {
        MODE: string;
        PROD: boolean;
        DEV: boolean;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

export default "";
