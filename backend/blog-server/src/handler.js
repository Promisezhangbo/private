const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*"
};

const textHeaders = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*"
};

const blogList = [{ id: 1, name: "我是一个blog" }];

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init.headers
    }
  });
}

function text(message, init = {}) {
  return new Response(message, {
    ...init,
    headers: {
      ...textHeaders,
      ...init.headers
    }
  });
}

function notFound(pathname) {
  return json(
    {
      error: "not_found",
      message: `No route matched ${pathname}`
    },
    { status: 404 }
  );
}

export async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,OPTIONS",
        "access-control-allow-headers": "content-type"
      }
    });
  }

  if (request.method !== "GET") {
    return json(
      {
        error: "method_not_allowed",
        message: `${request.method} is not supported`
      },
      {
        status: 405,
        headers: {
          allow: "GET, OPTIONS"
        }
      }
    );
  }

  if (url.pathname === "/" || url.pathname === "/health") {
    return json({
      name: "blog-server",
      status: "ok",
      runtime: "fetch",
      timestamp: new Date().toISOString()
    });
  }

  if (url.pathname === "/getBlogList") {
    return json(blogList);
  }

  if (url.pathname === "/robots.txt") {
    return text("User-agent: *\nAllow: /\n");
  }

  return notFound(url.pathname);
}
