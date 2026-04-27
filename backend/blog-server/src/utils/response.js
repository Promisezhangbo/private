/**
 * 统一构造 Fetch Response，并附带常用 HTTP 头。
 * Deno / Node 共用，避免每个路由重复写 content-type 与 CORS。
 */
const corsHeaders = {
  "access-control-allow-origin": "*"
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  ...corsHeaders
};

const textHeaders = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
  ...corsHeaders
};

/** JSON 响应，默认 no-store 防止 CDN 误缓存动态接口。 */
export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init.headers
    }
  });
}

/** 纯文本响应。 */
export function text(message, init = {}) {
  return new Response(message, {
    ...init,
    headers: {
      ...textHeaders,
      ...init.headers
    }
  });
}

/** 浏览器跨域预检 OPTIONS 的固定应答。 */
export function preflight() {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

/** 路径存在但 HTTP 方法不匹配时返回 405，并带上 Allow 头。 */
export function methodNotAllowed(method, allowedMethods) {
  return json(
    {
      error: "method_not_allowed",
      message: `${method} is not supported`
    },
    {
      status: 405,
      headers: {
        allow: allowedMethods.join(", ")
      }
    }
  );
}

/** 未注册路由。 */
export function notFound(pathname) {
  return json(
    {
      error: "not_found",
      message: `No route matched ${pathname}`
    },
    { status: 404 }
  );
}
