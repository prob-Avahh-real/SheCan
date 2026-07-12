# SheCan iOS TestFlight 构建指南

## 前置准备

### 1. Apple Developer 账号
- 需要付费 Apple Developer Program ($99/年)
- 登录 [developer.apple.com](https://developer.apple.com)
- 确保已在 App Store Connect 创建 App ID: `com.shecan.app`

### 2. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 3. 登录 Expo
```bash
eas login
```

### 4. 初始化项目
```bash
cd /Users/skat/projects/SheCan
eas init
```

---

## 配置 Secrets（API 密钥）

所有密钥通过 EAS Secrets 注入，**不提交到 Git**。

### 设置 Secrets
```bash
# DeepSeek API Key
eas secret:create --name DEEPSEEK_API_KEY --value "sk-xxxx" --scope project

# Supabase
eas secret:create --name SUPABASE_URL --value "https://xxxx.supabase.co" --scope project
eas secret:create --name SUPABASE_ANON_KEY --value "eyJhbGciOi..." --scope project
```

### 开发调试时
编辑 `src/services/env.ts` 的 `DEV_CONFIG` 对象，填入真实 key 即可在本机模拟器预览。

---

## 构建流程

### 开发构建（带 Dev Client，可热更新调试）
```bash
eas build --platform ios --profile development
```

### 内测版本（给 TestFlight 测试员）
```bash
eas build --platform ios --profile preview
```
构建完成后 EAS 自动提交到 TestFlight。

### 正式发布
```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

---

## 构建后步骤

1. 打开 [App Store Connect → TestFlight](https://appstoreconnect.apple.com)
2. 在「TestFlight」标签页找到构建版本
3. 填写「出口合规信息」（豁免：本 App 使用标准加密）
4. 添加内部测试员或外部测试组
5. 测试员会收到 TestFlight 邀请邮件

---

## 首次构建注意事项

首次 iOS 构建时 EAS 会提示：
- **生成 provisioning profile**: 选择「Let EAS handle it」
- **生成分发证书**: 选择「Let EAS handle it」
- **Push notification key**: 选择「No」（本阶段不需要推送）

全部选择自动处理即可，无需手动操作 Apple Developer 后台。

---

## 构建时间估算

| 类型 | 预计耗时 |
|------|---------|
| 首次构建（冷） | 15-25 分钟 |
| 增量构建（热） | 5-10 分钟 |
| TestFlight 审核 | 通常即时，偶尔 1-2 小时 |

---

## Supabase 部署后步骤

在启动 App 之前需要初始化 Supabase：

1. 创建 Supabase 项目: [supabase.com](https://supabase.com)
2. 在 SQL Editor 中执行 `supabase/migrations/001_init.sql`
3. 在 Authentication → Settings 中启用 Email 登录（或匿名登录）
4. 将 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 填入 `src/services/env.ts`
