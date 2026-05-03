---
name: ecommerce-visual-clip-scanning
description: 从直播/竞品长视频中，通过「画面抽帧 + 视觉AI分析」识别带货片段的工作流。适用于没有字幕、或主播展示与话语不同步的场景，比 transcript 方法更可靠。
category: media
---

# 电商视频视觉切片扫描法

通过**画面抽帧 + 视觉AI分析**识别直播/竞品视频中的带货高光片段。替代 Whisper 转写方法，更可靠（主播说到产品时镜头可能没对着产品）。

## 适用场景
- 直播回放：主播说到"这件外套"但镜头可能在拍书架/空镜
- 没有字幕的竞品视频
- 验证 transcript/关键词方法找到的候选片段是否真有产品展示

## 完整流程

### Step 1: 确认视频路径和规格

```bash
# 找视频文件
find /Users/yehya -type f -name "*.mp4" -size +100M 2>/dev/null | grep -v Library

# 确认时长、分辨率、编码
ffprobe -v quiet -print_format json -show_format -show_streams "VIDEO.mp4" 2>&1 | grep -E '"duration"|"width"|"height"|"codec_name"'
```

### Step 2: 全局采样抽帧（每5分钟1帧）

```bash
INPUT="/path/to/video.mp4"
OUTPUT_DIR="/tmp/scan"
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$INPUT")

mkdir -p "$OUTPUT_DIR"
for i in $(seq 0 300 $DURATION); do
  ffmpeg -ss $i -i "$INPUT" -vframes 1 -q:v 2 "$OUTPUT_DIR/frame_$(printf "%04d" $i).jpg" -y 2>/dev/null
  echo -n "."
done
echo ""
echo "完成: $(ls $OUTPUT_DIR/frame_*.jpg | wc -l) 帧"
```

**经验**：5分钟间隔是平衡精度和工作量的最优值。3.6小时视频 → 44帧。

### Step 3: 批量视觉AI分析

每批5张并行分析（避免单批过多延迟）：

```
每批次问题模板：
"主播在展示产品吗？画面里有没有拿着衣服/鞋子/配饰？简述画面内容。"

判断标准：
✅ 有产品：主播手持/举起服装/鞋/包
⚠️  不确定：主播在穿/戴产品（可接受）
❌  无产品：主播只说话/打电话/看手机/空镜
```

### Step 4: 定位时间 → 二次精确验证

初筛发现的时间点，在前后±30秒做精确验证：

```bash
# 精细验证帧
for ts in 2900 2930 2960 2990; do
  ffmpeg -ss $ts -i "$INPUT" -vframes 1 -q:v 2 "$OUTPUT_DIR/verify_$(printf '%06d' $ts).jpg" -y 2>/dev/null
done
```

**教训**：5分钟采样会漏掉短于5分钟的展示段（本案例：毛衣展示在54分钟，5分钟采样跳过了）。
解决方案：在发现产品类型后，对该时段做密集扫描（每30秒1帧）。

### Step 5: 切片段

```bash
INPUT="/path/to/video.mp4"
OUTPUT="/path/to/clips"

# 时间点（秒）→ 时:分:秒
ffmpeg -ss 3240 -i "$INPUT" -t 25 "$OUTPUT/精彩片段.mp4" -y 2>/dev/null
# 3240秒 = 54分钟
```

### Step 6: 验证片段画面质量

**必须步骤**：从切好的片段中抽帧再次确认，不能假设切的是对的。

```bash
# 从片段第5秒抽1帧验证
ffmpeg -ss 5 -i "$OUTPUT/clip.mp4" -vframes 1 "$OUTPUT/vc.jpg" -y 2>/dev/null

# vision_analyze 用 file:// 前缀
vision_analyze(image_url="file:///path/to/vc.jpg", question="主播有没有在展示产品？手持衣服/皮鞋吗？")
```

### Step 7: 交付或后续处理

- 直接交付 MP4 片段（无字幕）
- 或用 mcp-video 工具链烧字幕、加字幕
- 片段规格：20-25秒，H264，竖屏 1088x1920

## 关键教训

### ❌ 不要只信字幕/Transcript
**教训来源（2026/04/25）：** 用 transcript 文字选了5个片段，字面上都是"带货话术"，但验画面后发现：
- 片段5：主播站窗前说话，背景书架，**看不到产品**
- 片段7：主播坐椅子上说话，**全程没拿产品**
- 片段10：**主播根本没入镜**，3帧全是空镜

**结论**：主播说到"这件外套"时镜头可能切到别处，或根本没拿产品。Transcript 文字 ≠ 视觉内容。

### ❌ 5分钟采样会漏掉短展示
毛衣展示在 54:00，长度约30秒，5分钟采样跳过了。
**解决**：发现"有产品"类型后，对该时段做密集扫描（每30秒1帧）。

### ✅ file:// 前缀
vision_analyze 分析本地图片路径时，需要 `file://` 前缀，否则报错：
```
Error: Invalid image source. Provide an HTTP/HTTPS URL or a valid file path.
正确：file:///Users/yehya/tmp/vc01.jpg
```

### ✅ 验证后再切
切片段前先抽帧验证，切完后再抽帧确认。两层验证确保片段质量。

## 与 Whisper Workflow 的关系

| 方法 | 适用场景 | 局限性 |
|------|---------|--------|
| **Whisper 转写** | 有字幕可搜索，话语和产品同步 | 镜头可能不对着产品 |
| **视觉扫描（本方法）** | 镜头语言丰富，主播动作展示 | 可能错过纯话语型带货段 |

两种方法可以叠加：Whisper 找关键词 → 视觉扫描验证。

## 输出规格参考
- 分辨率：1088x1920（竖屏）
- 时长：20-25秒（挂车最佳）
- 编码：H264
- 文件大小：约 11-15MB/25秒
