export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = env.ALLOWED_ORIGIN && origin.startsWith(env.ALLOWED_ORIGIN) ? origin : "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        },
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, allowOrigin);
    }

    try {
      const body = await request.json().catch(() => ({}));
      const prompt = body?.prompt;
      const model = body?.model || "gemini-1.5-flash";

      if (!prompt || typeof prompt !== "string") {
        return json({ error: "Missing prompt" }, 400, allowOrigin);
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await resp.json();
      if (!resp.ok) return json({ error: data }, resp.status, allowOrigin);

      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "";
      return json({ text }, 200, allowOrigin);
    } catch (e: any) {
      return json({ error: e?.message || "Unknown error" }, 500, allowOrigin);
    }
  },
} satisfies ExportedHandler<Env>;

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

function json(obj: any, status = 200, origin = "*") {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin },
  });
}