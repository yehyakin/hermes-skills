---
name: ecommerce-video-clip-workflow
description: 竞品视频 → AI转写 → 识别带货节点 → 精剪切片 → 烧字幕的完整流水线。用于从长视频（直播/竞品回放）中批量提取挂车带货高光片段。
category: media
---

# 电商带货视频切片工作流

从长视频（直播/竞品视频）中自动识别高价值带货片段，精剪为挂车切片。

## 适用场景
- 竞品视频话术分析 + 切片提取
- 直播回放高光时刻挖掘
- 视频挂车素材批量制作

## 前置要求
- whisper.cpp 已编译 Metal 支持（Mac Apple Silicon）
- ffmpeg-full（支持 libass subtitles 滤镜）
- 模型：ggml-small.bin（中文识别准确 + 速度快）

## Pipeline

### Step 1: 提取音频
```bash
ffmpeg -i INPUT.mp4 -vn -c:a pcm_s16le audio.wav
```

### Step 2: Whisper 转写（Metal GPU，8x 实时）
```bash
cd ~/whisper.cpp
./build/bin/whisper-cli \
  -m models/ggml-small.bin \
  -f audio.wav \
  -l zh \
  --output-txt \
  --output-file transcript
```
**速度**：small 模型 Metal 加速 ~8x 实时（base 模型仅 0.8x 且中文差）

### Step 3: 定位带货节点
```bash
# 找"一号链接"、"必买"、"鲜货"、"限量"等关键词
grep -n "一号链接\|必买\|鲜货\|限量\|划算" transcript.txt

# 计算行号 → 视频时间（每行 ≈ 视频秒数 / 总行数）
python3 -c "
video_sec = 13112  # 视频总秒数
lines = 8480       # transcript 总行数
per_line = video_sec / lines  # ≈ 1.54秒/行
"
```

### Step 4: 精剪片段（ffmpeg）
```bash
ffmpeg -y -i INPUT.mp4 \
  -ss 1630 -t 25 \
  -c:v libx264 -crf 20 -preset fast \
  -c:a aac -b:a 128k \
  clip.mp4
```

### Step 5: 生成 SRT 字幕文件
```python
# 根据行号范围 + 每行秒数生成 SRT
def lines_to_srt(transcript_path, start_line, end_line, per_line_sec=1.54):
    # 生成带时间戳的 SRT 文件
```

### Step 6: 烧字幕（ffmpeg-full + libass）
```bash
/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -y \
  -ss START -t DURATION \
  -i INPUT.mp4 \
  -vf "subtitles=SRT_PATH:force_style='FontSize=28,Bold=1,OutlineColour=&H00000000,Outline=2'" \
  -c:v libx264 -crf 20 -preset fast \
  -c:a aac -b:a 128k \
  OUTPUT.mp4
```

**关键**：必须用 ffmpeg-full（Homebrew），标准 ffmpeg 缺 libass 滤镜。

## 关键经验

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Whisper CPU 太慢（3.6小时要跑7小时）| base 模型 + CPU | 改 whisper.cpp small 模型 + Metal |
| base 模型中文识别差 | 模型太小 | 换 ggml-small.bin |
| ffmpeg subtitles 滤镜报错 | 标准 ffmpeg 不含 libass | brew install ffmpeg-full |
| SRT 时间戳和片段对不上 | transcript 是纯文本无时间戳 | 用 总秒数/总行数 估算每行时长 |
| 中文路径导致 ffmpeg 报错 | 路径含中文字符 | 复制到 ~/tmp/ 简单路径 |

## 输出规格
- 分辨率：1088x1920（竖屏抖音/视频号）
- 时长：20-30秒（挂车最佳）
- 编码：H264 + AAC
- 字幕：内嵌 SRT burn-in
