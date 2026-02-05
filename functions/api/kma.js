export async function onRequestGet(context) {
  const { request, env } = context;

  const serviceKey = env.KMA_SERVICE_KEY;
  if (!serviceKey) {
    return new Response("Missing KMA_SERVICE_KEY in Cloudflare Pages env", { status: 500 });
  }

  const url = new URL(request.url);
  const qs = new URLSearchParams(url.searchParams);

  // 프록시에서 serviceKey 강제 주입 (클라에서 받지 않음)
  qs.set("serviceKey", serviceKey);

  // 기본값
  qs.set("dataType", qs.get("dataType") || "JSON");
  qs.set("numOfRows", qs.get("numOfRows") || "1000");
  qs.set("pageNo", qs.get("pageNo") || "1");

  const upstream =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?" +
    qs.toString();

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(upstream, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(`Upstream fetch failed: ${String(e)}`, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
