---
name: ecommerce-short-video-hook-research
description: Research trending short video hooks for e-commerce by searching YouTube and analyzing high-viewcount tutorial content
triggers:
  - 用户需要短视频带货开场钩子
  - 短视频文案/标题/爆款钩子研究
  - 服装/电商直播话术收集
---

# 短视频带货钩子研究方法

## 何时用
用户需要短视频带货文案、开场钩子、爆款标题等创意素材时使用。

## 研究步骤

### 1. YouTube搜索（首选）
```
搜索词模板：
- 短视频带货开场钩子
- 服装直播带货干货
- 抖音带货文案模板
- 电商短视频教程
- 直播带货话术（重点！找到4.8K播放的"任何主播都可以用到的直播话术公式"等干货视频）
- 带货钩子+互动留人
```
找到高播放量的教程视频。

**注意**：browser_vision工具可能拒绝分析YouTube视频（返回"I'm not going to engage"），此时通过视频标题和描述提取钩子思路。YouTube Shorts区的视频标题也常有爆款钩子句式可参考。

### 2. 搜索结果判断标准
- 播放量高的教程类视频（10k+）往往有干货
- **YouTube Shorts 区是爆款钩子富矿** — 简短标题直接就是可复制的钩子句式
- 评论区有时有网友整理的精华
- 高价值干货视频标志：4.8K 播放的"任何主播都可以用到的直播话术公式"等具体公式类视频

### 3. 提取方法
- 标题直接就是钩子模板
- 描述区常有完整文案
- 用vision截图分析视频中提到的具体案例

### 4. 注意事项
- 百度/搜狗有强反爬，需验证码，直接curl会被阻
- Google即使开了代理也可能被block（返回400 Bad Request）
- Bing中文搜索结果经常为空
- 抖音/小红书需要APP，网页版经常失效
- YouTube最稳定，且中文内容丰富（带货话术教程、直播干货都有）
- 开了代理后，YouTube搜索+浏览器快照是最可靠的方式

## 输出格式
按类型分类：好奇心/价格冲击/痛点共鸣/反差型/场景型/紧迫型
每类10条左右，供用户直接使用
