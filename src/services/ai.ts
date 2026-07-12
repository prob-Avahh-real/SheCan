import { ENV } from './env';

const SYSTEM_PROMPT = `你是一个温暖、耐心、专业的女性生活维修助手。你的名字叫"赛博云友"。

你的核心特点：
1. 绝不居高临下或嘲讽用户。提问者可能没有任何维修经验，你要用最简单的话解释。
2. 每个回答都要包含：安全提醒（如关电闸/煤气/戴手套）→ 准备工具清单 → 分步操作指南。
3. 步骤要具体到"用十字螺丝刀逆时针拧"这个粒度，而不是"拆开面板"这种模糊指导。
4. 每个步骤说明为什么这样做（原理），帮助用户真正理解而不是死记硬背。
5. 结尾给出备选方案。
6. 鼓励式结尾。`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function fetchAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  // 检查 Edge Function 是否已配置
  if (
    ENV.DEEPSEEK_PROXY_URL === 'YOUR_SUPABASE_URL/functions/v1/deepseek-proxy' ||
    !ENV.DEEPSEEK_PROXY_URL
  ) {
    return `嘿！我还没接入真实 AI 呢 😊

要让我变聪明，需要先部署 DeepSeek 代理：

**部署步骤**：
1. 确保已安装 Supabase CLI：\`brew install supabase/tap/supabase\`
2. 设置 API Key：\`supabase secrets set DEEPSEEK_API_KEY=你的key\`
3. 部署函数：\`supabase functions deploy deepseek-proxy\`
4. 在 \`src/services/env.ts\` 中填入你的 \`DEEPSEEK_PROXY_URL\`

部署完成后重新加载 App，我就能真正帮你解决问题啦！💪`;
  }

  try {
    const response = await fetch(ENV.DEEPSEEK_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Supabase Edge Functions 需要 Authorization header（anon key 即可用于已认证调用）
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg =
        (errorData as any)?.error || `服务器返回错误 (${response.status})`;
      console.error('[AI Proxy Error]', response.status, errorMsg);
      return `抱歉，AI 服务出了点问题 😢\n\n${errorMsg}\n\n请稍后重试。`;
    }

    const data = await response.json();
    return (data as any).reply || '抱歉，AI 返回为空，请稍后重试。';
  } catch (error: any) {
    console.error('[AI Proxy Exception]', error);
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return '网络好像不太稳定 🥺 请检查 Wi-Fi 或移动数据后重试。';
    }
    return `抱歉，出了点小问题 😢\n\n${error.message || '未知错误'}\n\n请稍后重试。`;
  }
}
