# Hermes Skills

> Hermes Agent 电商直播专用技能集合

本仓库包含为直播电商场景深度定制的 Hermes Agent Skills，涵盖竞品分析、视频剪辑、话术审核等核心工作流。

## 📂 目录结构

```
hermes-skills/
├── ecommerce/          # 电商运营
├── media/              # 视频剪辑
├── audit/              # 监查审计
└── hermes/             # 系统路由
```

## 🛒 电商运营 (ecommerce)

| Skill | 说明 | 触发词 |
|-------|------|--------|
| `neirong-fuoli` | 内容资产复利化 - 男装直播话术、产品卖点、爆款案例管理 | /记录选题、/深耕内容 |
| `douyin-video-acquisition` | 抖音视频获取与解析 - 从分享链接下载视频 | 抖音视频、竞品视频 |
| `ecommerce-short-video-hook-research` | 短视频带货钩子研究 - 爆款钩子分析 | 带货钩子、爆款分析 |

## 🎬 视频剪辑 (media)

| Skill | 说明 | 触发词 |
|-------|------|--------|
| `jianying-editor` | 剪映桌面版自动剪辑 - 素材导入、字幕、配音、导出 | 剪映、自动剪辑 |
| `jianying-editor-skill` | CapCut 草稿生成 - Mac 剪映草稿 SDK | CapCut、草稿生成 |
| `whisper-video-clipping-workflow` | Whisper 转写精剪 - 长视频转写+AI识别高光切片 | 视频转写、字幕切片 |
| `ecommerce-video-clip-to-shortform` | 直播→短切片流水线 - Whisper+SRT+FFmpeg | 直播切片、带货切片 |
| `ecommerce-video-clip-workflow` | 竞品视频精剪 - AI转写+识别带货节点+精剪 | 竞品视频、竞品分析 |
| `ecommerce-video-highlights` | 电商高光片段提取 - ffmpeg+Whisper+视觉AI | 高光片段、精彩瞬间 |
| `ecommerce-visual-clip-scanning` | 视觉带货识别 - 画面抽帧+AI分析 | 视觉识别、画面分析 |
| `yoyo-video-clipping-workflow` | 悠悠有鸽竞品精剪 - 完整流水线示例 | 竞品精剪 |

## ⚖️ 监查审计 (audit)

| Skill | 说明 | 触发词 |
|-------|------|--------|
| `speech-quality-review` | 话术质量审议 - 直播话术评分≥7.0 | 话术审核、话术评审 |
| `task-delivery-scoring` | 任务交付审计 - 准确性/完整性/时效性评分 | 任务评分、交付审计 |
| `system-health-monitor` | 系统健康审计 - Hermes/OpenClaw 进程/日志/资源 | 系统监控、健康检查 |
| `error-attribution-analysis` | 错误归因审计 - 根因分析+责任归属 | 错误分析、问题诊断 |

## 🔀 系统路由 (hermes)

| Skill | 说明 | 触发词 |
|-------|------|--------|
| `hermes-router` | Intent Router - 用户意图自动路由到正确 Skill | 路由、应该用哪个 Skill |

## 🚀 使用方法

这些 Skills 需要配合 [Hermes Agent](https://github.com/nousresearch/hermes-agent) 使用。

将 skills 目录链接到 Hermes 配置：

```bash
# 克隆本仓库
git clone https://github.com/yehyakin/hermes-skills.git

# 链接到 Hermes skills 目录
ln -s /path/to/hermes-skills ~/.hermes/skills
```

## 📝 Skill 格式

每个 Skill 包含：
- `SKILL.md` - Skill 定义（名称、描述、触发词、执行步骤）
- `references/` - 参考文档
- `scripts/` - 自动化脚本

## 🔧 适用场景

- 男装直播电商团队
- 竞品监控与视频分析
- 短视频带货内容生产
- AI 自动化剪辑流水线

## 📄 License

MIT

---

*Built with [Hermes Agent](https://github.com/nousresearch/hermes-agent)*
