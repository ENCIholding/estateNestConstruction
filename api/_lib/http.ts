const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export function methodNotAllowed(methods: string[]): Response {
  return jsonResponse(
    { message: "Method not allowed" },
    {
      status: 405,
      headers: {
        Allow: methods.join(", "),
      },
    }
  );
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {} as T;
  }

  return JSON.parse(rawBody) as T;
}

export function getRouteParam(request: Request, indexFromEnd = 0): string | null {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
  const segments = pathname.split("/").filter(Boolean);
  const value = segments.at(-(indexFromEnd + 1));

  return value ? decodeURIComponent(value) : null;
}
