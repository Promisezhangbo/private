import { client } from './generated/client.gen';
import * as sdk from './generated/sdk.gen';
import {
  configureOpenApiErrorHandling,
  openApiSettings,
  type OpenApiAuthState,
  type OpenApiErrorHandlingOptions,
} from './open-api-http-client';

export type OpenApiFnInit = Partial<Pick<OpenApiAuthState, 'BASE' | 'WITH_CREDENTIALS'>> & {
  token?: string | (() => string | Promise<string | undefined> | undefined);
  headers?: OpenApiAuthState['HEADERS'];
  errorHandling?: OpenApiErrorHandlingOptions;
};

/** 与 `operationId` 同名的 SDK；入参 `{ body, path, query }`，成功结果为 Axios，数据在 `.data`。 */
export function OpenApiFn(init?: OpenApiFnInit): typeof sdk {
  if (!init) return sdk;
  const { BASE, token, headers, WITH_CREDENTIALS, errorHandling } = init;
  if (BASE !== undefined) {
    openApiSettings.BASE = BASE;
    client.setConfig({ baseURL: BASE });
  }
  if (token !== undefined) {
    openApiSettings.TOKEN = typeof token === 'function' ? async () => (await token()) ?? '' : token;
  }
  if (headers !== undefined) openApiSettings.HEADERS = headers;
  if (WITH_CREDENTIALS !== undefined) {
    openApiSettings.WITH_CREDENTIALS = WITH_CREDENTIALS;
    client.setConfig({ withCredentials: WITH_CREDENTIALS });
  }
  if (errorHandling !== undefined) configureOpenApiErrorHandling(errorHandling);
  return sdk;
}

const u = client.getConfig().baseURL;
if (typeof u === 'string' && u) openApiSettings.BASE = u;
