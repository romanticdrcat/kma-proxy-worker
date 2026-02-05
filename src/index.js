export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1) 기상청 API 엔드포인트
    const upstream = new URL(
      "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    );

    // 2) Streamlit이 보낸 쿼리스트링을 그대로 전달
    //    (단, serviceKey는 Streamlit에서 받지 않고 Worker env에서 넣는다)
    url.searchParams.forEach((v, k) => {
      if (k !== "serviceKey") upstream.searchParams.set(k, v);
    });

    // 3) Worker 환경변수에 저장된 serviceKey를 추가
    //    ✅ env.KMA_SERVICE_KEY 는 다음 단계에서 설정할 거야
    upstream.searchParams.set("serviceKey", env.KMA_SERVICE_KEY);

    const res = await fetch(upstream.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
