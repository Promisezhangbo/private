import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

type Headers = Record<string, string>;
type MaybeFn<T> = T | ((x: unknown) => T | Promise<T>);

export type OpenApiAuthState = {
  BASE: string;
  WITH_CREDENTIALS: boolean;
  TOKEN?: string | MaybeFn<string | undefined>;
  HEADERS?: Headers | MaybeFn<Headers | undefined>;
};

export const openApiSettings: OpenApiAuthState = {
  BASE: 'http://api.yuniverse.com',
  WITH_CREDENTIALS: false,
};

export type OpenApiErrorReporter = (e: unknown) => void;

export type OpenApiErrorHandlingOptions = { reporter?: OpenApiErrorReporter; debounceMs?: number };

let reporter: OpenApiErrorReporter | undefined;
let debounceMs = 200;
let pending: unknown;
let timer: ReturnType<typeof setTimeout> | undefined;

export function configureOpenApiErrorHandling(opts: OpenApiErrorHandlingOptions): void {
  reporter = opts.reporter;
  debounceMs = opts.debounceMs ?? 200;
  if (timer) clearTimeout(timer);
  timer = undefined;
  pending = undefined;
}

function report(error: unknown): void {
  if (!reporter) return;
  pending = error;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    const last = pending;
    pending = undefined;
    if (last !== undefined) {
      try {
        reporter!(last);
      } catch {
        /* ignore */
      }
    }
  }, debounceMs);
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

export const openApiHttpClient = axios.create();

let silent = 0;

export function openApiSilent<T>(fn: () => T | Promise<T>): Promise<T> {
  silent++;
  return Promise.resolve().then(fn).finally(() => silent--);
}

async function applyAuth(config: InternalAxiosRequestConfig): Promise<void> {
  config.withCredentials = openApiSettings.WITH_CREDENTIALS;
  const url = config.url ?? '';
  if (url && !/^https?:\/\//i.test(url)) config.baseURL = openApiSettings.BASE;
  if (!config.headers) config.headers = new AxiosHeaders();
  const h = config.headers instanceof AxiosHeaders ? config.headers : AxiosHeaders.from(config.headers);
  const tok = openApiSettings.TOKEN;
  const token = typeof tok === 'function' ? await tok(undefined) : tok;
  if (!h.get('Authorization') && typeof token === 'string' && token.length > 0) {
    h.set('Authorization', `Bearer ${token}`);
  }
  const hdrSrc = openApiSettings.HEADERS;
  const extra = typeof hdrSrc === 'function' ? await hdrSrc(undefined) : hdrSrc;
  if (extra && typeof extra === 'object') {
    for (const [k, v] of Object.entries(extra)) {
      if (v != null && (h.get(k) == null || h.get(k) === '')) h.set(k, String(v));
    }
  }
}

openApiHttpClient.interceptors.request.use(async (config) => {
  await applyAuth(config);
  config.skipGlobalErrorHandler = config.skipGlobalErrorHandler === true || silent > 0;
  return config;
});

openApiHttpClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    const c = error.config as (InternalAxiosRequestConfig & { skipGlobalErrorHandler?: boolean }) | undefined;
    if (!c?.skipGlobalErrorHandler) report(error);
    return Promise.reject(error);
  },
);
