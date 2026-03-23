declare global {
  interface Window {
    __BUILD_TIME__?: string;
    VITE_ARK_API_KEY?: string;
  }

  const __BUILD_TIME__: string | undefined;
  const VITE_ARK_API_KEY: string | undefined;
}

export {};
