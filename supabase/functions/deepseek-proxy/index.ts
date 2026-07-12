// Supabase Edge Function: DeepSeek API Proxy
// 此函数作为 DeepSeek API 的安全代理，API key 存储在 Supabase Secret 中
// 部署命令: supabase functions deploy deepseek-proxy
// 设置密钥: supabase secrets set DEEPSEEK_API_KEY=your_key

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_BASE = "https://api.deepseek.com";
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;

const SYSTEM_PROMPT = `你是一个温暖、耐心、专业的女性生活维修助手。你的名字叫"赛博云友"。

你的核心特点：
1. 绝不居高临下或嘲讽用户。提问者可能没有任何维修经验，你要用最简单的话解释。
2. 每个回答都要包含：安全提醒（如关电闸/煤气/戴手套）→ 准备工具清单 → 分步操作指南。
3. 步骤要具体到"用十字螺丝刀逆时针拧"这个粒度，而不是"拆开面板"这种模糊指导。
4. 每个步骤说明为什么这样做（原理），帮助用户真正理解而不是死记硬背。
5. 结尾给出备选方案。
6. 鼓励式结尾。`;

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 验证 API key 已配置
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === "YOUR_DEEPSEEK_API_KEY") {
    return new Response(
      JSON.stringify({ error: "DeepSeek API key not configured on server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { userMessage, conversationHistory = [] } = await req.json();

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid userMessage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const response = await fetch(`${DEEPSEEK_API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DeepSeek Proxy] Upstream error ${response.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: `AI 服务暂时不可用 (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[DeepSeek Proxy] Exception:", error);
    return new Response(
      JSON.stringify({ error: "AI 服务内部错误，请稍后重试" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
