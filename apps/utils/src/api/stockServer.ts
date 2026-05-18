import { OpenApiApiServer } from '@packages/openapi';
import type {
  CreateStockRequest,
  DeleteStockRequest,
  DeleteStockResponse,
  StockListPage,
  StockRecord,
} from '@packages/openapi/api-server-gen-types';

const stockServerApi = OpenApiApiServer({
  BASE: import.meta.env.VITE_API_SERVER_BASE?.trim() || 'https://api-server.promisezhangbo.deno.net',
  errorHandling: { reporter: () => {}, debounceMs: 200 },
});

export type ServerStockRecord = StockRecord;

export type { StockListPage };

/** GET /getStockList 分页列表 */
export async function getStockList(params?: {
  page?: number;
  pageSize?: number;
  stock_code?: string;
}): Promise<StockListPage> {
  const response = await stockServerApi.getStockList({
    query: {
      page: params?.page,
      pageSize: params?.pageSize,
      stock_code: params?.stock_code,
    },
  });
  if (response.data == null) {
    return {
      items: [],
      total: 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
  }
  return response.data;
}

/** GET /getStock?id= */
export async function getStock(id: number): Promise<ServerStockRecord> {
  const response = await stockServerApi.getStock({ query: { id } });
  if (response.data == null) {
    throw new Error('getStock: empty response');
  }
  return response.data;
}

/** POST /createStock */
export async function createStock(payload: CreateStockRequest): Promise<ServerStockRecord> {
  const response = await stockServerApi.createStock({ body: payload });
  if (response.data == null) {
    throw new Error('createStock: empty response');
  }
  return response.data;
}

/** POST /deleteStock */
export async function deleteStock(payload: DeleteStockRequest): Promise<DeleteStockResponse> {
  const response = await stockServerApi.deleteStock({ body: payload });
  if (response.data == null) {
    throw new Error('deleteStock: empty response');
  }
  return response.data;
}
