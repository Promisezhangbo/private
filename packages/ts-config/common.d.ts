declare global {
  interface Window {
    VITE_ARK_API_KEY?: string;
  }

  const VITE_ARK_API_KEY: string | undefined;

  interface ImportMetaEnv {
    readonly VITE_DEPLOY_TAG?: string;
    readonly VITE_BLOG_SERVER_BASE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
