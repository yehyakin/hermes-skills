---
name: jianying-editor
description: 用剪映桌面版自动剪辑视频（Mac/Windows通用）。支持素材导入、字幕生成、AI配音、特效转场、自动导出。Mac上使用需要额外修复文件。
triggers:
  - 剪映自动剪辑
  - 视频精剪剪映
  - jianying draft
  - 剪映草稿生成
---

# 剪映编辑器 Skill（Mac 版）

## 状态

⚠️ **草稿能生成，但存在素材导入 bug**（2026-04-28 实测更新）

- 草稿 JSON 文件**生成成功**，路径正确，剪映 5.9 能识别
- **真正问题**：skill 创建了时间线引用（`material_id`），但**没有把视频文件真正导入草稿素材库**
  - `draft_materials` 数组是**空的**
  - `Resources/` 目录是**空的**
  - 结果：时间线上有片段，但剪映里看不到任何内容（"幽灵引用"）
- 草稿路径：`/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft`

### 剪映 5.9 真实草稿结构

```
草稿文件夹/
├── draft_meta_info.json    ✅ JSON
├── draft_content.json      ✅ JSON（时间线）
├── draft_info.json         ✅ JSON
├── draft_cover.jpg        ✅ 封面图
├── draft_settings/        ✅ 配置文件
├── Resources/             ✅ 素材二进制（视频/音频）
└── common_attachment/     ✅ 附件
```

### 草稿文件格式对比

| 文件 | skill 生成 | 真实剪映 5.9 | 状态 |
|------|-----------|-------------|------|
| `draft_info.json` | JSON ✅ | JSON ✅ | 兼容 |
| `draft_content.json` | JSON ✅ | JSON ✅ | 兼容 |
| `draft_meta_info.json` | JSON ✅ | JSON ✅ | 兼容 |
| `Resources/` | **空 ❌** | 有视频文件 ✅ | **bug** |
| `draft_materials` | **空 ❌** | 有素材列表 ✅ | **bug** |

### 当前结论

**skill 的 jy_wrapper.py 有素材导入缺陷** — 草稿框架完整，但视频文件从未被复制到草稿的 `Resources/` 目录，也没有写入 `draft_materials` 素材库。需要深入研究 `pyJianYingDraft` 的 `material` 相关操作来修复此问题。

---

## Mac 安装要点

### 1. 剪映 5.9 下载地址
夸克网盘：https://pan.quark.cn/s/81566e9c6e08
（6.0+ 弹窗太多，自动化脚本会失效）

### 2. Skill 安装（GitHub: luoluoluo22/jianying-editor-skill）
不能用 git clone（认证问题），用 GitHub API + curl 下载：

```bash
# 目录结构
~/.hermes/skills/jianying-editor/
├── SKILL.md
├── requirements.txt
├── scripts/
│   ├── jy_wrapper.py
│   ├── utils/          # 注意：必须有 skill_path.py, media_normalizer.py
│   ├── core/
│   └── vendor/
│       └── pyJianYingDraft/
│           ├── metadata/      # 注意：17个文件在 metadata/ 子目录下
│           │   ├── __init__.py
│           │   ├── effect_meta.py
│           │   ├── filter_meta.py
│           │   └── ...（共17个）
│           └── assets/
│               ├── draft_content_template.json
│               └── draft_meta_info.json
└── examples/
```

### 3. 必须修复的问题

**问题1：Mac 路径未支持**
- 文件：`scripts/utils/formatters.py`
- 问题：`get_default_drafts_root()` 只支持 Windows，不识别 Mac
- 修复：添加 Darwin 分支检测 `~/Movies/JianyingPro/User Data/Projects/com.lveditor.draft`

**问题2：metadata 目录结构**
- pyJianYingDraft 的 metadata 文件在 `metadata/` 子目录，不在顶层
- 需要下载17个文件到 `scripts/vendor/pyJianYingDraft/metadata/`

**问题3：assets 缺失**
- 需要 `draft_content_template.json` 和 `draft_meta_info.json`

### 4. Python 依赖
```bash
pip install -r requirements.txt
```
注意：会降级 edge-tts、requests、websockets，可能与 hermes-agent 冲突。单独装不影响剪映功能。

---

## 使用方法

### 标准流程（推荐）

```python
import os, sys

skill_root = '/Users/yehya/.hermes/skills/jianying-editor/scripts'
vendor_dir = os.path.join(skill_root, 'vendor')
sys.path.insert(0, vendor_dir)
sys.path.insert(0, skill_root)

from utils.env_setup import setup_env
setup_env()

from jy_wrapper import JyProject

# 创建项目（Mac 路径自动检测）
project = JyProject('项目名称', overwrite=True)

# 添加视频片段
# add_clip(媒体路径, source_start='5s', duration='10s', target_start='0s')
project.add_clip('/path/to/video.mp4', source_start='5s', duration='10s', target_start='0s')

# 保存草稿
result = project.save()
print(result['draft_path'])
```

### 打开剪映后的操作
1. **必须重启剪映**（不重启看不到新草稿）
2. 打开剪映 → 找到对应项目名
3. 检查时间线
4. 如需导出 → 手动点击导出（或用 auto_exporter.py）

---

## 重要限制

- **素材导入 bug**：skill 生成的时间线引用没有对应的素材文件，剪映里看不到内容
- **自动导出**：依赖 uiautomation（Windows only），Mac 不支持自动导出，需手动点
- **媒体分析**：macOS 的 `mediaanalysisd` 可能卡死，大文件先用 FFmpeg 预处理
- **素材路径**：草稿 JSON 里写的是绝对路径，文件移动后需要修复
- **Mac 推荐方案**：用 FFmpeg 直出 MP4，跳过剪映草稿（因为 skill 素材导入有 bug）

---

## 相关文件

- Skill 根目录：`~/.hermes/skills/jianying-editor/`
- 剪映草稿：`~/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/`
- Python 脚本存放位置：项目根目录（不是 Skill 目录内）
