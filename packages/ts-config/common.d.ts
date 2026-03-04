declare global {
  interface Window {
    __BUILD_TIME__?: string;
  }

  const __BUILD_TIME__: string | undefined;
}

export {};
