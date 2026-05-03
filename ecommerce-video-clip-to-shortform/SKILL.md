---
name: ecommerce-video-clip-to-shortform
description: 电商直播长视频 → 带货短切片完整流水线：Whisper转写 → SRT挖掘爆点 → FFmpeg精切 → PIL字幕包装
---

# 电商直播视频 → 带货切片工作流

## 背景
从电商直播长视频（60-120分钟）中提取 15-30秒 带货短切片，用于短视频平台发布。

## 完整工作流

### 第一步：Whisper 转写
```bash
whisper /path/to/video.mp4 \
  --model base \
  --language zh \
  --output_format srt \
  --output_dir /tmp/whisper_output
```

### 第二步：从 SRT 提取爆点时间
```python
keywords = ['138', '上车', '限量', '350克', '埃及', '万针', '不变形', '扣一']
# 找含有关键词的字幕行，输出：时间戳、关键词、上下文各2句
```

### 第三步：切精剪片段（FFmpeg）
```bash
ffmpeg -y -ss 00:08:09 -i 原始视频.mp4 -t 20 \
  -c:v libx264 -crf 23 -preset fast \
  -c:a aac -b:a 128k \
  -movflags +faststart 输出.mp4
```

### 第四步：加字幕包装（FFmpeg 无 drawtext 时）
MacOS 打包环境通常没有 drawtext，用 PIL 生成叠加图：

```python
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920  # 竖屏 9:16

def make_overlay(filename, line1, color1, size1, line2, color2, size2):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    font_paths = [
        '/Users/yehya/Library/Fonts/27-华康饰艺体W7-GB.ttc',
        '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    ]
    font1, font2 = None, None
    for fp in font_paths:
        try:
            font1 = ImageFont.truetype(fp, size1)
            font2 = ImageFont.truetype(fp, size2)
            break
        except: continue
    
    # 大字 + 黑色描边
    bbox1 = draw.textbbox((0, 0), line1, font=font1)
    tw1, th1 = bbox1[2]-bbox1[0], bbox1[3]-bbox1[1]
    x1, y1 = (W-tw1)//2, int(H*0.10)
    for dx,dy in [(-2,-2),(-2,2),(2,-2),(2,2),(-2,0),(2,0),(0,-2),(0,2)]:
        draw.text((x1+dx,y1+dy), line1, fill=(0,0,0,255), font=font1)
    draw.text((x1,y1), line1, fill=color1, font=font1)
    
    # 副标题
    bbox2 = draw.textbbox((0, 0), line2, font=font2)
    tw2, th2 = bbox2[2]-bbox2[0], bbox2[3]-bbox2[1]
    x2, y2 = (W-tw2)//2, y1+th1+20
    draw.text((x2,y2), line2, fill=color2, font=font2)
    
    img.save(filename, 'PNG')
```

### 第五步：FFmpeg 叠加字幕图
```bash
ffmpeg -y -ss 00:08:08 -i 原始视频.mp4 \
       -i /tmp/overlay_A.png -t 5 \
  -filter_complex "[0:v][1:v]overlay=0:0:format=yuv420[out]" \
  -map "[out]" -c:v libx264 -crf 23 -preset fast \
  -c:a aac -b:a 128k -movflags +faststart 输出.mp4
```

### 爆点关键词参考（服装电商）
| 类别 | 关键词 |
|------|--------|
| 价格 | 138、到手、折扣、上车、链接 |
| 品质 | 350克、埃及棉、80支、不变形、万针刺绣 |
| 催单 | 扣一、限量、错过不再、倒计时 |

## 关键教训

1. **AutoClip 等 AI 切片工具** → 识别完整话题段（3-10分钟），不是最终切片，需人工再切
2. **SRT 字幕是精准切片的依据**：按句/按意切，不按时长机械切
3. **竖屏 9:16（1080×1920）** 是直播标准，剪辑时注意尺寸匹配
4. **直播画面冲击力弱** → 需要字幕包装增强，单独切片段不够爆
5. **FFmpeg drawtext 不一定可用** → PIL 叠加图是跨平台备用方案
6. **字幕位置**：竖屏视频，文字放顶部 10-15% 区域，避免遮挡主播/产品主体
7. **短视频黄金3秒**：开头3秒必须用最强爆点（价格揭示 > 品质背书 > 产品特写）
