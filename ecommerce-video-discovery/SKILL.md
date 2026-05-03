---
name: ecommerce-video-discovery
description: 电商视频高光发现路由器 — 根据视频特征自动选择最优发现路径：Whisper路径（有字幕）/视觉扫描路径（无字幕）/AutoClip路径（快速批量）。
triggers:
  - 发现高光
  - 找带货片段
  - 分析视频片段
  - 竞品视频发现
  - 视频精剪
category: ecommerce
version: 1.0.0
tags: [电商, 视频发现, 高光切片, 自动化路由]
---

# 电商视频高光发现路由器

## 核心定位

收到"分析视频找高光"类任务时，根据视频特征自动选择最优发现路径，不需要用户指定用哪个工具。

**下游调用 skill**：
- `whisper-video-clipping-workflow` → Whisper路径（有字幕、话语丰富）
- `ecommerce-visual-clip-scanning` → 视觉扫描路径（无字幕、画面信息多）
- `ecommerce-video-highlights` → 三阶段AI分析（需要商业价值评估）

---

## 路由决策树

```
用户：分析这个视频找带货高光
    │
    ├── 用户是否指定了方法？
    │   ├── 指定 Whisper/转写/话术 → 走 whisper-video-clipping-workflow
    │   ├── 指定视觉/画面/镜头 → 走 ecommerce-visual-clip-scanning
    │   └── 指定 AI 分析/评估 → 走 ecommerce-video-highlights
    │
    ├── 用户没指定 → 分析视频特征
    │   ├── 视频时长 < 5分钟 + 有字幕轨道 → whisper-video-clipping-workflow
    │   ├── 视频时长 > 30分钟 + 无字幕 → 视觉扫描路径
    │   └── 需要批量切片 → AutoClip → whisper-video-clipping-workflow
    │
    └── 用户说"随便/都行/你决定" → 默认走 whisper-video-clipping-workflow
```

---

## 路由提示词模板

根据选择的路径，在任务开头注入：

**Whisper路径注入：**
> 该视频有字幕/话术丰富，优先使用 whisper-video-clipping-workflow：从 Whisper 转写入手，用关键词定位高光片段，再 FFmpeg 切割。完成后存入 neirong-fuoli 素材库。

**视觉扫描路径注入：**
> 该视频无字幕或镜头语言丰富，优先使用 ecommerce-visual-clip-scanning：从画面抽帧 + AI 视觉分析入手，识别有产品展示的时间段，再验证+切割。完成后存入 neirong-fuoli 素材库。

**三阶段AI路径注入：**
> 需要评估视频的商业价值，使用 ecommerce-video-highlights：抽帧 + Whisper + AI 视觉三阶段分析，输出带商业价值评分的片段清单。完成后存入 neirong-fuoli 素材库。

---

## 统一输出标准

无论走哪个路径，最终交付格式统一：

```markdown
# {竞品名} 视频高光分析

**视频**：{标题/链接}
**时长**：{X}分钟
**发现方法**：{Whisper/视觉扫描/AI分析}
**分析时间**：{日期}

---

## 推荐片段清单

| # | 时间戳 | 时长 | 场景类型 | 商业价值 | 话术亮点 |
|---|--------|------|----------|----------|----------|
| 1 | 01:41 | 25s | 产品特写 | ⭐⭐⭐⭐⭐ | "..." |
| 2 | 03:22 | 30s | 搭配讲解 | ⭐⭐⭐⭐ | "..." |

---

## 话术亮点摘录

{3-5句核心话术，可直接复用}

---

## 下一步

- [ ] 发布清单已生成 → `/发布视频 {标题}`
- [ ] 存入 content-fuoli 素材库
- [ ] 人工审核后精调导出
```

---

## 关键约束

1. **不重复发明轮子**：直接调用现有 skill，不复制 skill 内的步骤代码
2. **完成后必须存入 neirong-fuoli**：切片数 + 话术亮点 + 视频元信息 → `~/content-fuoli/`
3. **选路径前先问用户**：如果视频特征模糊，主动确认用哪种方法
4. **碎片化场景用视觉扫描**：竖屏直播回放，主播边走动边讲解，Whisper 容易失效
