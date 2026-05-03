---
name: yoyo-video-clipping-workflow
description: 悠悠有鸽竞品视频精剪流水线 - Whisper转录 + AI识别带货节点 + 精剪切片
tags:
  - 视频剪辑
  - whisper
  - autoclip
  - 竞品分析
  - 电商直播
created: 2026-04-26
---

# 悠悠有鸽 - 竞品视频精剪流水线

## 概述
从悠悠有鸽（香港YoYo）直播竞品视频中，通过 Whisper 转录 → AI分析识别带货节点 → 剪辑精剪切片的完整流水线。

## 环境准备

### Python 环境
- AutoClip 需要 **Python 3.11+**（系统默认 3.9 不支持 `type |` 语法）
- 使用 `~/.hermes-guardian/venv/bin/python3.11`
- 依赖安装：
  ```
  pip install fastapi uvicorn python-multipart dashscope==1.23.5 \
    openai pydub pysrt pydantic python-dotenv aiofiles \
    requests aiohttp cryptography yt-dlp watchfiles whisper
  ```

### Whisper 模型
- 模型缓存位置：`~/.cache/whisper/`
- 已下载：`base.pt`, `large-v3-turbo.pt`
- whisper CLI 位置：`~/.hermes-guardian/venv/bin/whisper`

## 流水线步骤

### Step 1：提取音频（ffmpeg）
视频文件大（4GB+），需要先提取音频再转录。

```bash
# 提取音频（WAV格式，单声道16kHz）
ffmpeg -y -i "INPUT.mp4" \
  -ac 1 -ar 16000 -c:a pcm_s16le \
  -t 600 \          # 可选：限制时长（秒）
  "output.wav"

# 快速测试：只提取前1分钟
ffmpeg -y -i "INPUT.mp4" \
  -ac 1 -ar 16000 -c:a pcm_s16le \
  -t 60 \
  "output_1min.wav"
```

### Step 2：Whisper 转录
```bash
# 创建输出目录
mkdir -p /tmp/whisper_output

# 使用 tiny 模型（最快，用于测试）
whisper "audio.wav" \
  --model tiny \
  --language zh \
  --output_format srt \
  --output_dir /tmp/whisper_output

# 使用 base 模型（平衡速度与精度）
whisper "audio.wav" \
  --model base \
  --language zh \
  --output_format srt \
  --output_dir /tmp/whisper_output
```

**性能参考（Mac M2 CPU）**：
- 1分钟音频：约2分钟（tiny模型）
- 10分钟音频：转录超时（约20分钟+）
- `base` 模型比 `tiny` 慢约3-5倍
- 建议分批处理或使用 GPU

### Step 3：AutoClip 后端
```bash
# 启动后端（需要 Python 3.11）
cd ~/autoclip_mvp
mkdir -p uploads outputs logs  # 首次需要创建
PYTHONPATH=~/autoclip_mvp \
  ~/.hermes-guardian/venv/bin/python3.11 \
  backend_server.py

# 健康检查
curl http://localhost:8000/health
```

### Step 4：AutoClip 前端
```bash
cd ~/autoclip_mvp/frontend
npm install      # 首次需要
npm run dev      # 启动后访问 http://localhost:3000
```

## 测试视频路径
```
/Users/yehya/Downloads/竞品视频/香港🇭🇰YoYo20260425201954.mp4
  - 时长：100分29秒
  - 大小：4.3GB
  - 适合测试完整流程
```

## 悠悠有鸽转录样本
```
[00:00.000 → 00:03.720] 这个门店去给来去做这么一个直播
[00:03.720 → 00:04.360] 我们最近的话呢
[00:04.360 → 00:08.600] 也是有很多的一些上心
[00:08.600 → 00:09.960] 大部分的话都是断秀
[00:09.960 → 00:12.600] 那么最近也是一直后台很多老粉
...
```
→ 主播正在介绍新品上架，引导观众关注

## AutoClip 输出说明（重要）

**AutoClip 识别的是话题级片段（3-10分钟），不是最终精剪！**

- AutoClip 前端（localhost:3000）显示的是完整话题段
- 最终切片（15-30秒）需要用 Whisper SRT 找精准高潮时间点，再用 FFmpeg 切
- 不要期望在 AutoClip 前端直接拿到短切片

## 从 AutoClip 片段切精剪（15-30秒）

### 1. 获取片段时间范围
```bash
curl -s "http://localhost:8000/api/projects/{PROJECT_ID}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
clips = sorted(data['clips'], key=lambda x: x['final_score'], reverse=True)
for c in clips[:10]:
    print(c['start_time'], c['end_time'], c['final_score'])
"
```

### 2. 从 SRT 找爆点关键词时间戳
```python
# 搜索138/350克/上车/扣1/埃及棉/万针/不变形等关键词
grep -n "138\|350\|扣一\|上车\|万针\|不变形\|压胶\|埃及\|销冠" \
  /tmp/whisper_yoyo/yoyo_full.srt | head -30
```

### 3. 用 FFmpeg 切精剪片段（关键：terminal(background=true)，不要用 &）
```bash
VIDEO="/path/to/video.mp4"
OUTPUT="/Users/yehya/Downloads/竞品视频/clips"
mkdir -p "$OUTPUT"

# 切30秒片段（从爆点时间前2秒开始）
ffmpeg -y -ss 00:07:19 -i "$VIDEO" -t 30 \
  -c:v libx264 -crf 23 -preset fast \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "$OUTPUT/clip_138价格揭示.mp4" 2>&1 | tail -2
```

**端口对照表**：
- AutoClip 后端：`localhost:8000`
- AutoClip 前端：`localhost:3000`
- 前端路由：需通过 `/api/...` 调用后端

## 已知问题 & 解决方案
| 问题 | 原因 | 解决 |
|------|------|------|
| `TypeError: unsupported operand for \|` | Python 3.9 不支持类型联合语法 | 用 Python 3.11 |
| `ModuleNotFoundError: dashscope` | 依赖未安装 | pip install dashscope==1.23.5 |
| `Directory 'uploads' does not exist` | 首次运行缺少目录 | mkdir -p uploads outputs logs |
| `vite: command not found` | npm 依赖未安装 | npm install |
| Whisper 转录超时 | base 模型太慢 | 用 tiny 模型测试 |
| AutoClip 片段太长 | 正常，AI识别的是话题段 | 用 SRT+FFmpeg 再切精剪 |
| FFmpeg 背景编码失败 | 禁止在 foreground 命令里用 `&` | 用 `terminal(background=true)` |
| 竖屏视频素材方向 | 直播是 9:16 竖屏（1080×1920） | 输出保持原分辨率 |
