import type { ResponseType } from 'axios';
import { client } from './generated/client.gen';
import * as sdk from './generated/sdk.gen';
import {
  configureOpenApiErrorHandling,
  openApiSettings,
  type OpenApiAuthState,
  type OpenApiErrorHandlingOptions,
} from './generated/openapi-http.gen';

export type { ResponseType };

export type OpenApiFnInit = Partial<Pick<OpenApiAuthState, 'BASE' | 'WITH_CREDENTIALS'>> & {
  /**
   * 拼在 `BASE` 后面的路径段（如网关统一前缀 `/api`）。**跨域时请用完整的 `BASE`**（含协议与域名），不要只传此项。
   * 与 `BASE` 同时存在时：`effectiveBase = BASE + pathPrefix`（自动去重斜杠）。
   */
  pathPrefix?: string;
  /**
   * 写入 Hey `client` 的默认 `responseType`，会参与每次请求合并（`beforeRequest` 里 `..._config` + `...options`）。
   * 单次 SDK 调用仍可传 `responseType` **覆盖**（生成代码里 `...options` 在默认 `json` 之后）。
   */
  defaultResponseType?: ResponseType;
  token?: string | (() => string | Promise<string | undefined> | undefined);
  headers?: OpenApiAuthState['HEADERS'];
  errorHandling?: OpenApiErrorHandlingOptions;
};

/** 合成 `OpenApiFn` 使用的 API 根；未传任何一项则返回 `undefined`（不改 client）。 */
export function resolveOpenApiBase(init: Pick<OpenApiFnInit, 'BASE' | 'pathPrefix'>): string | undefined {
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
 * 仅设置 API 根地址（与 `OpenApiFn({ BASE })` 等价），便于在入口用环境变量注入。
 * @example configureOpenApiBase(import.meta.env.VITE_API_BASE_URL)
 */
export function configureOpenApiBase(
  baseURL: string,
  more?: { responseType?: ResponseType },
): void {
  openApiSettings.BASE = baseURL;
  client.setConfig({ baseURL, ...more });
}

/** 只改全局默认 `responseType`（与 `OpenApiFn({ defaultResponseType })` 一致）。 */
export function configureOpenApiResponseType(responseType: ResponseType): void {
  client.setConfig({ responseType });
}

/** 与 `operationId` 同名的 SDK；入参 `{ body, path, query }`，成功结果为 Axios，数据在 `.data`。 */
export function OpenApiFn(init?: OpenApiFnInit): typeof sdk {
  if (!init) return sdk;
  const { token, headers, WITH_CREDENTIALS, errorHandling, defaultResponseType, ...rest } = init;
  const base = resolveOpenApiBase(rest);

  const patch: {
    baseURL?: string;
    withCredentials?: boolean;
    responseType?: ResponseType;
  } = {};
  if (base !== undefined) {
    openApiSettings.BASE = base;
    patch.baseURL = base;
  }
  if (WITH_CREDENTIALS !== undefined) {
    openApiSettings.WITH_CREDENTIALS = WITH_CREDENTIALS;
    patch.withCredentials = WITH_CREDENTIALS;
  }
  if (defaultResponseType !== undefined) {
    patch.responseType = defaultResponseType;
  }
  if (Object.keys(patch).length > 0) {
    client.setConfig(patch);
  }

  if (token !== undefined) {
    openApiSettings.TOKEN = typeof token === 'function' ? async () => (await token()) ?? '' : token;
  }
  if (headers !== undefined) openApiSettings.HEADERS = headers;
  if (errorHandling !== undefined) configureOpenApiErrorHandling(errorHandling);
  return sdk;
}

const fromSpec = client.getConfig().baseURL;
if (typeof fromSpec === 'string' && fromSpec.length > 0) {
  openApiSettings.BASE = fromSpec;
}

export {
  configureOpenApiErrorHandling,
  openApiHttpClient,
  openApiSilent,
  type OpenApiAuthState,
  type OpenApiErrorHandlingOptions,
  type OpenApiErrorReporter,
} from './generated/openapi-http.gen';

export { client } from './generated/client.gen';
export * from './generated/sdk.gen';
