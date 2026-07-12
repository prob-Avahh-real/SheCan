// 环境变量 / 配置管理
// 开发时在此配置，生产构建时通过 EAS Secrets 注入
//
// ⚠️ 安全注意事项：
// - DeepSeek API Key 绝不能放在客户端！已迁移至 Supabase Edge Function 代理
// - SUPABASE_URL 和 SUPABASE_ANON_KEY 使用 EXPO_PUBLIC_ 前缀是安全的（anon key 设计为可公开）
// - Edge Function URL 使用你的 Supabase 项目 URL + /functions/v1/deepseek-proxy

interface EnvConfig {
  DEEPSEEK_PROXY_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// 开发环境配置
const DEV_CONFIG: EnvConfig = {
  DEEPSEEK_PROXY_URL: 'YOUR_SUPABASE_URL/functions/v1/deepseek-proxy',
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
};

function getEnv(): EnvConfig {
  return {
    DEEPSEEK_PROXY_URL:
      process.env.EXPO_PUBLIC_DEEPSEEK_PROXY_URL || DEV_CONFIG.DEEPSEEK_PROXY_URL,
    SUPABASE_URL:
      process.env.EXPO_PUBLIC_SUPABASE_URL || DEV_CONFIG.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEV_CONFIG.SUPABASE_ANON_KEY,
  };
}

export const ENV = getEnv();
