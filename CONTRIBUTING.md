# 贡献指南

感谢您对 Hermes Skills 项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 Bug 修复
- 💡 新功能提案
- 📖 文档改进
- ✅ 测试用例
- 🎨 示例代码

## 📋 目录

- [行为准则](#行为准则)
- [快速开始](#快速开始)
- [提交更改](#提交更改)
- [Skill 编写规范](#skill-编写规范)
- [提交信息规范](#提交信息规范)

---

## 行为准则

请尊重所有参与者，保持友好和专业的交流环境。我们坚持：

- 🙏 包容性：欢迎各种背景的贡献者
- 🤝 合作性：积极帮助他人，共同进步
- 📖 开放性：乐于分享知识和经验
- ✅ 负责性：对提交的质量负责

---

## 快速开始

### 1. Fork 本仓库

点击 GitHub 页面右上角的 **Fork** 按钮。

### 2. 克隆你的 Fork

```bash
git clone https://github.com/YOUR_USERNAME/hermes-skills.git
cd hermes-skills
```

### 3. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或者
git checkout -b fix/your-bug-fix
```

### 4. 进行更改并提交

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

在 GitHub 上打开你的分支，点击 **New Pull Request**。

---

## Skill 编写规范

### 目录结构

```
skill-name/
├── SKILL.md          # 必须：Skill 定义文件
├── examples/          # 必须：至少包含一个示例
│   └── basic_usage.py
├── scripts/           # 可选：自动化脚本
│   └── helper.py
└── references/        # 可选：参考文档
    └── api_doc.md
```

### SKILL.md 格式

每个 Skill 的 `SKILL.md` 必须包含以下内容：

```yaml
---
name: skill-name
description: 简短描述（不超过 100 字）
category: ecommerce|media|audit|system
version: "1.0.0"
triggers:
  - 触发词1
  - 触发词2
examples:
  - "示例1：用户说 xxx，Skill 会 xxx"
  - "示例2：用户说 xxx，Skill 会 xxx"
---
```

### 描述要求

- **简洁**：一句话说明 Skill 的核心功能
- **明确**：说明适用场景和限制
- **专业**：使用正确的术语

### 触发词设计

触发词应覆盖以下维度：

| 维度 | 示例 |
|------|------|
| 动作词 | 剪辑、分析、获取、审核 |
| 名词 | 视频、话术、字幕、竞品 |
| 专有名词 | 抖音、剪映、Whisper、YoYo |
| 场景 | 直播切片、带货视频、竞品分析 |

### 执行步骤规范

执行步骤必须清晰、可操作：

```markdown
## 执行步骤

### 步骤 1：准备阶段
- 检查输入参数
- 验证环境依赖

### 步骤 2：执行阶段
- 调用 API/脚本
- 处理返回数据

### 步骤 3：输出阶段
- 格式化结果
- 保存到指定位置
```

### 示例代码规范

- 代码必须有注释
- 使用清晰的变量命名
- 添加错误处理
- 提供完整可运行的示例

```python
"""
示例：如何获取抖音视频信息

用法：
    python example.py "https://v.douyin.com/xxxxx"
"""

import sys
import json

def fetch_video_info(url: str) -> dict:
    """获取抖音视频信息"""
    try:
        # TODO: 实现获取逻辑
        return {"title": "示例", "duration": 60}
    except Exception as e:
        print(f"获取失败: {e}")
        return {}

if __name__ == "__main__":
    url = sys.argv[1]
    info = fetch_video_info(url)
    print(json.dumps(info, indent=2, ensure_ascii=False))
```

---

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(douyin): add batch download support` |
| `fix` | Bug 修复 | `fix(jianying): resolve material import bug` |
| `docs` | 文档更新 | `docs: update README with new examples` |
| `style` | 代码格式 | `style: format SKILL.md` |
| `refactor` | 重构 | `refactor(whisper): optimize transcription speed` |
| `test` | 测试 | `test: add unit tests for router` |
| `chore` | 杂项 | `chore: update dependencies` |

### Scope 范围

使用 Skill 名称作为 scope：

- `douyin-video-acquisition` → `douyin`
- `jianying-editor` → `jianying`
- `hermes-router` → `router`
- `ecommerce-video-highlights` → `ecommerce`

### 示例

```
feat(douyin): add batch download support for multiple URLs

- 支持逗号分隔的多链接
- 自动去重
- 进度显示

Closes #123
```

```
fix(jianying): resolve material import bug on Mac

The draft was created but video files were not copied to Resources/.
Now properly imports materials using pyJianYingDraft APIs.

Fixes #45
```

---

## 新增 Skill 检查清单

提交新 Skill 时，请确认：

- [ ] `SKILL.md` 包含完整的 frontmatter
- [ ] 至少有一个可运行的示例在 `examples/` 目录
- [ ] 示例代码有注释和错误处理
- [ ] 触发词覆盖主要使用场景
- [ ] README.md 已更新（添加到对应分类表格）
- [ ] 无硬编码的个人路径

---

## 问题反馈

如果您发现任何问题或有疑问，请：

1. 📝 查看 [已存在的问题](https://github.com/yehyakin/hermes-skills/issues)
2. 🔍 搜索类似问题
3. ➕ 创建新的 Issue（使用对应模板）

---

再次感谢您的贡献！🙏
