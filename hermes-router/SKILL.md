---
name: hermes-router
description: |
  Hermes Intent Router — 自动将用户意图路由到正确 skill 的决策层。
  当用户描述任务时，识别最匹配的 skill 并加载。
  基于 gstack routing rules 模式：trigger pattern → target skill。
  电商直播场景专用路由：竞品分析、视频剪辑、话术审核、系统诊断。
triggers:
  - "路由"
  - "应该用哪个 skill"
  - "这件事找哪个"
  - intent routing
  - skill dispatch
---

# Hermes Intent Router

电商直播场景的 Skill 自动路由层。参考 gstack 的 trigger → skill 映射模式。

---

## 路由规则（按场景分类）

### 🎬 视频剪辑 / 竞品分析

| 用户意图（触发词） | 路由到 |
|---|---|
| 竞品视频 / YoYo / 悠悠有鸽 / 香港直播 | `media/yoyo-video-clipping-workflow` |
| 剪辑视频 / 切片段 / 精剪 / 切片 | `jianying-editor-skill` |
| 转写字幕 / Whisper / 音频转文字 | `whisper-video-clipping-workflow` |
| 带货片段 / 直播切片 / 挂车 / 高光 | `media/ecommerce-video-clip-workflow` |
| 抖音视频 / Douyin / v.douyin.com | `media/douyin-video-acquisition` |
| 字幕烧录 / SRT / ASS 字幕 | `media/ecommerce-video-clip-to-shortform` |
| 视频去无声 / 删除静音段 | `mcp__video__video_ai_remove_silence` |
| 视频转码 / 格式转换 / 压缩 | `mcp__video__video_convert` |
| 视频加速 / 慢动作 / 调速 | `mcp__video__video_speed` |
| 视频加字幕 / 字幕压制 | `mcp__video__video_subtitles` |

### 🛒 电商 / 直播

| 用户意图（触发词） | 路由到 |
|---|---|
| 短视频钩子 / 爆款钩子 / hook 写法 | `ecommerce/ecommerce-short-video-hook-research` |
| 主播话术 / 直播话术 / 带货文案审核 | `audit/speech-quality-review` |
| 直播复盘 / 电商数据分析 | `media/ecommerce-video-highlights` |
| 选品 / 产品分析 / 竞品对比 | `ecommerce/ecommerce-short-video-hook-research` |

### 🎙️ 飞书 / 通知

| 用户意图（触发词） | 路由到 |
|---|---|
| 飞书发消息 / 飞书通知 / 群发 | `integration/hermes-feishu-interactive-cards` |
| 飞书卡片 / 交互卡片 / 按钮消息 | `integration/hermes-feishu-interactive-cards` |
| 更新飞书消息 / 编辑卡片 | `integration/hermes-feishu-card-update` |
| 飞书 @mention / 群聊格式 | `integration/hermes-feishu-at-mention` |

### 🖥️ 系统 / 网关

| 用户意图（触发词） | 路由到 |
|---|---|
| 网关崩溃 / gateway 挂了 / 网关无响应 | `software-development/hermes-gateway-crash-diagnosis` |
| 系统健康 / 健康检查 / 进程状态 | `audit/system-health-monitor` |
| 修复自己 / 自检 / 系统异常 | `software-development/hermes-functional-health-check` |
| 记忆同步 / Memos / 记忆丢失 | `note-taking/memos-memory` |
| Session 卡死 / 会话无响应 | `software-development/hermes-session-corruption-diagnosis` |
| 环境问题 / 依赖损坏 / Python 报错 | `software-development/hermes-environment-diagnosis` |
| 模型延迟 / API 超时 / 模型不响应 | `observability/model-status-dashboard` |

### 🔍 代码 / 开发

| 用户意图（触发词） | 路由到 |
|---|---|
| debug / 报错 / 出错了 / 修复 | `software-development/systematic-debugging` |
| 写代码 / 实现功能 / 开发任务 | `software-development/integrated-development-workflow` |
| 写 plan / 规划任务 / 任务分解 | `software-development/writing-plans` |
| Code Review / 审查代码 / PR review | `github/github-code-review` |
| Git PR / 创建 PR / 合并分支 | `github/github-pr-workflow` |
| Claude Code / 委托编码 | `autonomous-ai-agents/claude-code` |

### 🎨 设计 / 创意

| 用户意图（触发词） | 路由到 |
|---|---|
| 信息图 / 图表 / 可视化 | `creative/baoyu-infographic` |
| 架构图 / 系统图 / 云架构 | `creative/architecture-diagram` |
| Excalidraw 图 / 手绘风格图 | `creative/excalidraw` |
| ASCII 艺术 / 字符画 | `creative/ascii-art` |
| 音乐生成 / AI 作曲 / Suno | `media/heartmula` |
| 像素画 / Pixel Art | `creative/pixel-art` |

### 📊 数据 / MLOps

| 用户意图（触发词） | 路由到 |
|---|---|
| 微调模型 / Fine-tune / LoRA | `mlops/training/peft` 或 `mlops/training/unsloth` |
| 量化模型 / GGUF / llama.cpp | `mlops/inference/gguf` |
| 模型评测 / Benchmark / MMLU | `mlops/evaluation/lm-evaluation-harness` |
| 部署模型 / vLLM / serving | `mlops/inference/vllm` |
| HuggingFace / 下载模型 | `mlops/huggingface-hub` |

### 🏢 角色模式

| 用户意图（触发词） | 路由到 |
|---|---|
| 竞品分析 / 选品策略 / GMV / 运营策略 | `roles/chief-operations-officer` |
| 视频剪辑 / 字幕包装 / 切片制作 / 视觉物料 | `roles/chief-content-officer` |
| 系统稳定 / 网关监控 / API 维护 / 技术架构 | `roles/chief-technology-officer` |
| 话术审核 / 任务交付打分 / 监察 | `audit/speech-quality-review` 或 `audit/task-delivery-scoring` |

### 🤖 Agent 协作

| 用户意图（触发词） | 路由到 |
|---|---|
| OpenClaw 问题 / OpenClaw 异常 | `openclaw-guardian/openclaw-supervisor` |
| OpenClaw 健康检查 | `openclaw-guardian/openclaw-system-health-check` |
| 双 Agent 协作 / Hermes + OpenClaw | `autonomous-ai-agents/hermes-openclaw-collaboration` |
| 梦境系统 / Dream | `openclaw-guardian/openclaw-dream-system-status-check` |

### 🧠 记忆 / 知识库

| 用户意图（触发词） | 路由到 |
|---|---|
| 查记忆 / 我们之前 / 上次说过 | `note-taking/memos-memory` |
| Obsidian / 笔记 | `note-taking/obsidian` |
| 写 Memos / 存记忆 / 重要记录 | `note-taking/memos-memory` |

---

## 路由决策流程

```
用户消息
  ↓
1. 关键词精确匹配（触发词表）
  ↓
2. 语义相似度（描述模糊时）
  ↓
3. 默认 fallback：直接回答，不强求调 skill
```

**注意**：路由是建议性的，不是强制的。如果 skill 不匹配，手动回答也可以。

---

## 触发词优先级

1. **专有名称**（YoYo、悠悠有鸽）→ 精确路由
2. **动词**（剪辑、转写、审核、debug）→ 按功能路由
3. **名词**（话术、字幕、视频）→ 按类型路由
4. **模糊意图**（"帮我处理"）→ 问清楚再路由

---

## 电商直播核心链路

```
竞品视频 → yoyo-video-clipping-workflow（转写+AI分析）
         → whisper-video-clipping-workflow（如只需字幕）
         → ecommerce-visual-clip-scanning（如无字幕）
         ↓
带货节点 → jianying-editor-skill（剪映精剪）
         ↓
成品 → 字幕压制 → 交付
```

