import type { ResponseType } from 'axios';

/** 生成的 `openapi-http.gen.ts` 会维护的一份“运行时可变配置”。每个 `*-gen/` 目录都有自己独立的一份。 */
export type OpenApiCommonSettings = {
  BASE: string;
  WITH_CREDENTIALS: boolean;
  TOKEN?: string | ((x: unknown) => string | Promise<string | undefined> | undefined);
  HEADERS?: Record<string, string> | ((x: unknown) => Record<string, string> | Promise<Record<string, string> | undefined> | undefined);
};

/** 全局错误上报（由 `openapi-http.gen.ts` 实现；这里仅透传配置结构）。 */
export type OpenApiCommonErrorHandlingOptions = { reporter?: (e: unknown) => void; debounceMs?: number };

/**
 * 统一的初始化入参形态：各 `*-gen/index.ts` 都会把它映射成 `<OpenApiXxxFnInit>`。
 * 目的：多 YAML 场景下保持初始化语义一致（BASE/token/headers/responseType 等）。
 */
export type OpenApiCommonInit = Partial<Pick<OpenApiCommonSettings, 'BASE' | 'WITH_CREDENTIALS'>> & {
  pathPrefix?: string;
  defaultResponseType?: ResponseType;
  token?: string | (() => string | Promise<string | undefined> | undefined);
  headers?: OpenApiCommonSettings['HEADERS'];
  errorHandling?: OpenApiCommonErrorHandlingOptions;
};

/**
 * 计算最终 baseURL：支持把网关前缀拼到 BASE 后（自动处理斜杠）。
 * - 跨域：传完整 BASE（含协议域名端口）更稳
 * - 同源：可只传 pathPrefix（例如 `/api`）
 */
export function resolveBase(init: Pick<OpenApiCommonInit, 'BASE' | 'pathPrefix'>): string | undefined {
  const { BASE, pathPrefix } = init;
  if (BASE !== undefined && pathPrefix !== undefined) {
    const a = BASE.replace(/\/$/, '');
    const b = pathPrefix.startsWith('/') ? pathPrefix : `/${pathPrefix}`;
    return `${a}${b}`;
  }
  if (BASE !== undefined) return BASE;
  if (pathPrefix !== undefined) return pathPrefix;
  return undefined;
}

/**
 * 生成每个 `<name>-gen/index.ts` 里的 `OpenApi<Name>Fn`。
 * 关键点：把“初始化逻辑”抽到公共函数里复用，避免每个 spec 复制一份。
 */
export function createOpenApiInitializer<TSdk>(deps: {
  /** 该 spec 的 SDK（`sdk.gen.ts` 全量导出对象） */
  sdk: TSdk;
  /** 该 spec 的 Hey API client（用于写入 baseURL/withCredentials/responseType 等） */
  client: { setConfig: (c: { baseURL?: string; withCredentials?: boolean; responseType?: ResponseType }) => void; getConfig: () => { baseURL?: unknown } };
  /** 该 spec 的运行时 settings（来自注入的 `openapi-http.gen.ts`） */
  settings: OpenApiCommonSettings;
  /** 可选：对接全局错误上报设置（来自注入的 `openapi-http.gen.ts`） */
  configureErrorHandling?: (opts: OpenApiCommonErrorHandlingOptions) => void;
}) {
  const { sdk, client, settings, configureErrorHandling } = deps;

  // 初始 baseURL：若 spec 自带 `servers.url`，Hey API 会把它写进 client config，这里同步到 settings 里供 axios 拦截器使用。
  const fromSpec = client.getConfig().baseURL;
  if (typeof fromSpec === 'string' && fromSpec.length > 0) {
    settings.BASE = fromSpec;
  }

  return function initSdk(init?: OpenApiCommonInit): TSdk {
    // 不传 init：直接返回 SDK（沿用当前 client/settings 中已有配置）
    if (!init) return sdk;
    const { token, headers, WITH_CREDENTIALS, errorHandling, defaultResponseType, ...rest } = init;
    const base = resolveBase(rest);

    // 写入 Hey API client config：影响生成的 request 合并逻辑（baseURL/withCredentials/responseType）。
    const patch: { baseURL?: string; withCredentials?: boolean; responseType?: ResponseType } = {};
    if (base !== undefined) {
      settings.BASE = base;
      patch.baseURL = base;
    }
    if (WITH_CREDENTIALS !== undefined) {
      settings.WITH_CREDENTIALS = WITH_CREDENTIALS;
      patch.withCredentials = WITH_CREDENTIALS;
    }
    if (defaultResponseType !== undefined) {
      patch.responseType = defaultResponseType;
    }
    if (Object.keys(patch).length > 0) {
      client.setConfig(patch);
    }

    // 写入 axios 拦截器会用到的动态认证/扩展头（由 `openapi-http.gen.ts` 在请求前读取并注入到 headers）。
    if (token !== undefined) {
      settings.TOKEN = typeof token === 'function' ? async () => (await token()) ?? '' : token;
    }
    if (headers !== undefined) settings.HEADERS = headers;

    // 全局错误上报策略（可选）：如需要在业务侧统一 toast/日志上报，传 reporter 即可。
    if (errorHandling !== undefined && configureErrorHandling) configureErrorHandling(errorHandling);
    return sdk;
  };
}

