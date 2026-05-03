---
name: whisper-video-clipping-workflow
description: 用 whisper.cpp 从长视频中提取字幕、定位高价值片段、并剪辑带货切片的完整流程。适用电商竞品视频分析、直播切片提取。
category: media
---

# Whisper 视频字幕提取 + 带货切片剪辑工作流

## 适用场景
- 竞品直播间录屏 → 提取话术 → 剪辑带货片段
- 直播回放 → 自动找"一号链接"/"必买"/"鲜货"等高光时刻
- 任意长视频 → 生成可搜索字幕 → 精准定位内容

---

## 完整流程

### 步骤 1：安装 whisper.cpp（Mac Metal 加速）

```bash
# 安装 cmake
brew install cmake

# 克隆 whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git ~/whisper.cpp

# 编译（不用 CoreML，用 Metal 加速）
cd ~/whisper.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release -DWHISPER_COREML=OFF -DWHISPER_METAL=ON
cmake --build build -j$(sysctl -n hw.ncpu)
```

### 步骤 2：下载模型

| 模型 | 大小 | 速度 | 适用场景 |
|------|------|------|---------|
| **small** | 465MB | ~8x 实时（M1） | **中文推荐，精度高速度快** |
| base | 141MB | ~0.8x 实时 | 仅英文或测试 |

```bash
cd ~/whisper.cpp
curl -L -o models/ggml-small.bin "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin"
```

### 步骤 3：提取音频 + 转录

```bash
# 从视频提取音频
ffmpeg -i /path/to/video.mp4 -vn -c:a pcm_s16le /path/to/audio.wav

# 后台运行转录（--output-txt 只输出文本）
cd ~/whisper.cpp
./build/bin/whisper-cli \
  -m models/ggml-small.bin \
  -f /path/to/audio.wav \
  -l zh \
  --output-txt \
  --output-file /path/to/transcript \
  > /path/to/whisper_log.txt 2>&1 &

# 注意：whisper-cli 跑完才写文件，不是流式的
# 查看进程：ps aux | grep whisper-cli
```

### 步骤 4：定位高价值片段

```python
# whisper.txt 是纯文本（无时间戳），每行约 1.54 秒
# 计算公式：行号 × 1.54 = 视频秒数

import subprocess

# 找"一号链接"、"鲜货"、"必买"、"好价格"等关键词
result = subprocess.run(
    ['grep', '-n', '一号链接\\|鲜货\\|必买\\|好价格\\|限量\\|抢', '/path/to/transcript.txt'],
    capture_output=True, text=True
)
print(result.stdout)

# 找关键词密度最高的时段
```

### 步骤 5：剪辑片段（每段 45 秒）

```python
# 时间戳计算：line_number × 1.54 = seconds
clips = [
    ("01_开场马甲介绍", 919, 45),
    ("02_限量15件抢鲜", 1630, 45),
    # ...
]

import subprocess

for name, start_sec, duration in clips:
    output = f"/path/to/clips/{name}.mp4"
    subprocess.run([
        'ffmpeg', '-y', '-i', '/path/to/video.mp4',
        '-ss', str(start_sec - 5),  # 多录5秒前的内容
        '-t', str(duration),
        '-c:v', 'libx264', '-crf', '23', '-preset', 'ultrafast',
        '-c:a', 'aac', '-b:a', '128k',
        output
    ], check=True)
```

### 步骤 6：生成字幕文件（SRT）

```python
import subprocess

def sec_to_srt_timestamp(sec):
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    ms = int((sec % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

with open('/path/to/transcript.txt', 'r') as f:
    lines = f.readlines()

for clip_name, start_sec, end_sec in clips:
    start_line = int((start_sec - 5) / 1.54)
    end_line = int((end_sec + 5) / 1.54)
    
    srt_entries = []
    for i in range(start_line, min(end_line, len(lines))):
        text = lines[i].strip()
        if not text:
            continue
        ts_start = sec_to_srt_timestamp(i * 1.54 - 5)
        ts_end = sec_to_srt_timestamp((i + 1) * 1.54 - 5)
        srt_entries.append(f"{len(srt_entries)+1}\n{ts_start} --> {ts_end}\n{text}\n")
    
    with open(f'/path/to/clips/{clip_name}.srt', 'w') as f:
        f.write('\n'.join(srt_entries))
```

### 字幕工具两种方案

### 方案A：openai-whisper（推荐，更简单）
```bash
# 直接 pip 安装，不需要编译
pip install openai-whisper

# 直接输出 SRT（无需手动转换）
whisper "/path/to/video.mp4" \
  --model base --language zh \
  --output_format srt \
  --output_dir /tmp/
# 输出：/tmp/video.mp4.srt
```

### 方案B：whisper.cpp（C++ 版本，Metal 加速）
见上方步骤 1-3，需要编译 + 下载模型

**两种方案对比：**
| | openai-whisper | whisper.cpp |
|--|--|--|
| 安装 | `pip install` | 编译 + 下载模型 |
| 输出 SRT | `--output_format srt` 直接出 | 需自己拼接时间戳 |
| 速度 | 较慢（纯 CPU） | M1 Metal ~8x 实时 |
| 推荐场景 | 短视频、快速验证 | 长视频、批量处理 |

## 步骤 7：Burn 字幕到视频

```bash
# 基础版（字体/样式用 SRT 内置或默认）
ffmpeg -y -i "/path/to/clip.mp4" \
  -vf "subtitles=/path/to/clip.srt" \
  -c:v libx264 -crf 20 -preset fast \
  -c:a aac -b:a 128k \
  /path/to/output_with_subs.mp4
```

### 带样式的版本（白字+黑描边+粗体）
```bash
ffmpeg -y -i "/path/to/clip.mp4" \
  -vf "subtitles=/path/to/clip.srt:force_style='FontName=Arial,FontSize=22,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=1,Bold=1'" \
  -c:v libx264 -crf 20 -preset fast \
  -c:a aac -b:a 128k \
  /path/to/output_with_subs.mp4
```

### ⚠️ FFmpeg 字幕支持检查（重要！）
Homebrew 自带的 FFmpeg 默认**不包含 ASS/字幕滤镜**，需要验证：
```bash
ffmpeg -filters 2>/dev/null | grep -E "drawtext|subtitles|ass"
```
必须同时看到 `subtitles` 和 `ass` 滤镜才算支持。

**Homebrew FFmpeg 缺字幕支持的解决方案：**
1. **检查是否可用**：`ffmpeg -filters 2>/dev/null | grep subtitles`
2. **如果缺失**：从源码编译 FFmpeg，配置时启用：
   ```bash
   ./configure --enable-libass --enable-libfontconfig --enable-libfreetype --enable-libharfbuzz ...
   ```
3. **验证编译成功**：`ffmpeg -filters | grep subtitles` 应显示 `subtitles` 和 `ass`
4. **常见坑**：`--disable-programs` 会禁止 ffmpeg 二进制生成，配置时不要加这个选项

---

## 双轨架构：路径A vs 路径B

```
竞品视频 / 直播回放
    ├── 路径A（精准）：whisper + 关键词 + 场景
    │       → 高价值精准切片 → burn字幕 → 精品成片
    │
    └── 路径B（批量）：AutoClip（zhouxiaoka/autoclip_mvp, ⭐958）
            → AI全自动切片 → 路径A字幕烧录 → 快速产出
```

**何时用路径A：** 高价值视频、精准需求、人工审核把关
**何时用路径B：** 批量产出、快速试错、牺牲精度换效率

---

## AutoClip MVP 快速部署（本机已装好）

```bash
# 本机路径
~/autoclip_mvp/

# 配置 API Key（千问或 SiliconFlow）
nano ~/autoclip_mvp/data/settings.json

# 启动 Web 界面
cd ~/autoclip_mvp && ./start_dev.sh
# 访问 http://localhost:8000

# 命令行处理
python main.py --video 输入.mp4 --srt 输入.srt --project-name "项目名"
```

---

## 已验证的本地环境状态

| 工具 | 状态 | 路径 |
|------|------|------|
| whisper.cpp | ✅ 已编译 | `~/whisper.cpp/` |
| small模型 | ✅ 已下载 | `~/whisper.cpp/models/ggml-small.bin` |
| openai-whisper | ✅ pip 直接装 | `whisper` CLI |
| FFmpeg (字幕版) | ✅ 已源码编译 | `/Users/yehya/bin/ffmpeg` |
| whisper.cpp | ✅ 已编译 | `~/whisper.cpp/` |
| PySceneDetect | ✅ 已安装 | pip3 |
| AutoClip MVP | ✅ 已克隆+依赖装好 | `~/autoclip_mvp/` |

## 批处理脚本模板（本机已写入 /tmp/）

| 脚本 | 位置 | 用途 |
|------|------|------|
| whisper_transcribe.sh | `/tmp/whisper_transcribe.sh` | 视频 → 音频 → Whisper转录 |
| find_and_cut.sh | `/tmp/find_and_cut.sh` | transcript → 关键词定位 → 片段清单 |
| batch_cut.sh | `/tmp/batch_cut.sh` | 视频+清单 → FFmpeg批量切割 |

---

## 关键参数速查

| 参数 | 值 |
|------|-----|
| whisper.cpp 路径 | `~/whisper.cpp` |
| whisper-cli 路径 | `~/whisper.cpp/build/bin/whisper-cli` |
| 中文推荐模型 | `ggml-small.bin` (465MB) |
| 每行文本对应时长 | **1.54 秒**（实测算过） |
| M1 Metal 转录速度 | ~8x 实时（30s 音频 = 3.7s） |
| 全流程 3.6h 视频 | ~24 分钟（实测） |

## ⚠️ 关键教训（经验教训）

### ⚠️ whisper.cpp SRT 输出的坑（单字/单句切分问题）— 2026/04/26

**症状：** whisper-cli 加 `--max-len 1` 时，每个字/每个词生成独立 SRT 条目，100+ 条无法烧录。

**正确参数：**
```bash
# 正确：不要加 --max-len 参数（或设为更大值如 10）
~/whisper.cpp/build/bin/whisper-cli \
  -m ~/whisper.cpp/models/ggml-small.bin \
  -f audio.wav \
  --language zh \
  --output-srt \
  -of /tmp/output  # 不要加 --max-len
```

**如果已生成的 SRT 需要合并相邻短句：** 用 Python 后处理脚本（见下方「字幕合并脚本」）。

### ⚠️ whisper.cpp 不能直接读 MP4（必须先转 WAV）

whisper-cli 只能读 WAV/FLAC/OGG 等音频格式，**不能直接读 MP4/MOV 等视频文件**。

```bash
# 必须先用 ffmpeg 提取音频
ffmpeg -y -i video.mp4 \
  -ar 16000 -ac 1 -acodec pcm_s16le \
  audio.wav
```

**推荐流程：**
```bash
VIDEO="/path/to/video.mp4"
AUDIO_WAV="/tmp/audio.wav"
SRT_OUT="/tmp/video.srt"

# 1. 提取音频
ffmpeg -y -i "$VIDEO" -ar 16000 -ac 1 -acodec pcm_s16le "$AUDIO_WAV"

# 2. Whisper 转录（不要加 --max-len）
~/whisper.cpp/build/bin/whisper-cli \
  -m ~/whisper.cpp/models/ggml-small.bin \
  -f "$AUDIO_WAV" \
  --language zh \
  --output-srt \
  -of "/tmp/$(basename $VIDEO .mp4)" 2>&1 | tail -3

# 3. SRT 在 /tmp/$(basename $VIDEO .mp4).srt
```

### ⚠️ Whisper small 模型中文方言识别仍然不准

whisper.cpp ggml-small 模型（465MB）在中文方言场景下：
- 部分词汇识别错误（如"变形"听成"窗个"）
- 单字输出时每个字变成独立条目
- **不能依赖它做精准字幕**，只能做时间戳参考

**解法：**
1. 用 small 模型抓时间戳（快，~3s 处理 22s 音频）
2. 用 LLM（MiniMax/Claude）根据文本内容纠错合并
3. 或直接下载 medium/large 模型提高准确率

### 字幕合并脚本（处理 whisper.cpp 单字输出）

```python
#!/usr/bin/env python3
"""合并 whisper.cpp 输出的过短 SRT 条目，合并为约 2-4 秒一条"""
import re, sys

def merge_srt(input_srt, max_chars=8, min_gap_ms=200):
    entries = []
    buf_start = buf_end = buf_text = None
    
    for line in open(input_srt):
        m = re.match(r'(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})', line.strip())
        if m:
            if buf_text:
                entries.append((buf_start, buf_end, buf_text))
            buf_start, buf_end = m.group(1), m.group(2)
            buf_text = ''
        elif line.strip() and not line.strip().isdigit():
            buf_text += line.strip()
    
    if buf_text:
        entries.append((buf_start, buf_end, buf_text))
    
    # 合并相邻条目
    merged = []
    i = 0
    while i < len(entries):
        group = [entries[i]]
        j = i + 1
        while j < len(entries) and len(''.join(e[2] for e in group)) < max_chars:
            group.append(entries[j])
            j += 1
        start = group[0][0]
        end = group[-1][1]
        text = ''.join(e[2] for e in group)
        merged.append((start, end, text))
        i = j
    
    for idx, (s, e, t) in enumerate(merged, 1):
        print(f"{idx}\n{s} --> {e}\n{t}\n")

if __name__ == '__main__':
    merge_srt(sys.argv[1])
```

### 在线 Whisper API 不稳定的教训（2026/04/26）

测试结果：
| API | 端点 | 结果 |
|-----|------|------|
| MiniMax Whisper | `api.minimax.chat/v1/audio/transcriptions` | 404 page not found |
| NVIDIA NIM Whisper | `np.nanxione.cn/v1/audio/transcriptions` | 超时/无响应 |
| NVIDIA NIM Whisper | `integrate.api.nvidia.com/v1/audio/transcriptions` | 无响应 |

**结论：本地 Whisper.cpp 是最可靠方案**，网络 API 不稳定。

### FFmpeg 源码编译翻车记录（2026/04/26）
**症状：** `make` 编译完所有 .o 库文件，但 `make install` 后找不到 ffmpeg 二进制
**根因排查过程：**
1. `.version` 文件是空的（0字节），make 认为这是最新构建标记，跳过所有编译
   → **修复：`rm -f .version` 强制重编译**
2. `--disable-programs` 配置项禁止生成 ffmpeg/ffprobe 等二进制程序
   → **修复：configure 时去掉 `--disable-programs`**
3. Homebrew 的 libavcodec 头文件在 `/opt/homebrew/include/`，与源码冲突 → 删掉 `-I/opt/homebrew/include` 只保留 Cellar 路径
4. `make distclean` 会删除源码目录，不能用
5. ulimit -n 256 导致并行编译时文件句柄耗尽 → ulimit -n 65536

**正确编译步骤：**
```bash
cd ffmpeg_src/
rm -f .version  # 强制重编译
make -j4        # 并行编译（ulimit -n 65536 防文件句柄耗尽）
make install    # 安装二进制
```

### 必须验画面，不能只信字幕
**教训来源（2026/04/25）：**
用 transcript 文字选了 5 个片段，字面上都是"带货话术"，但验画面后发现：
- 片段5：主播站窗前说话，背景书架，**看不到产品**
- 片段7：主播坐椅子上说话，**全程没拿产品**
- 片段10：**主播根本没入镜**，3帧全是空镜

**结论：主播说到"这件外套"时镜头可能切到别处，或主播根本没拿产品。字幕文字 ≠ 视觉内容。**

### 重要补充：视觉扫描可以作为独立主流程
本次实践中（2026/04/25）直接用**画面抽帧 + 视觉AI**作为主要发现方法，效果很好：
- 从 3.6 小时直播中扫 44 帧（每5分钟1帧）
- 批量 vision_analyze 识别有产品展示的时间点
- 二次精确验证 + 密集扫描补漏
- 切7个片段，验证后6个合格

**什么时候用哪种方法：**
- 视频有清晰带货话术+镜头语言丰富 → 优先 Whisper（效率高）
- 镜头语言混乱/主播常走动/画面信息量大 → 用视觉扫描（更可靠）
- 需要快速批量产出/不想手动筛 → 用 AutoClip（全自动切片）
- 最佳实践：AutoClip批量切片 → Whisper烧字幕 → 人工审核排序

---

### 正确工作流（修正版）

```
1. whisper 转录 → 得到带时间戳的 transcript.txt
2. 关键词搜索 → 标记候选时间段（如 "一号链接" 出现在第XX行）
3. ✅ 这里新增步骤：每候选时段抽 1 帧验画面
   - ffmpeg -ss {行号*1.54} -i video.mp4 -vframes 1 frame.jpg
   - vision_analyze 确认该时刻主播在展示产品
4. 验证通过 → 才用 ffmpeg 切片段
5. burn 字幕 → 交付
```

---

## 注意事项

1. **whisper-cli 不流式输出** — 跑完才写 transcript.txt，用 `--output-txt` 确认
2. **CoreML 编译失败** — Mac M1 用 `-DWHISPER_METAL=ON` 即可，CoreML 会报错
3. **small 模型中文比 base 准很多** — base 对中文识别很差，千万别用
4. **ffmpeg 竖屏视频** — 录屏通常是 1088x1920 或类似比例，H264 编码
6. **mcp-video 有 4GB 文件限制** — 直接用 ffmpeg 绕过（实测 4.3GB 视频报 invalid_input）

### 批量切割多个片段的正确方法（2026/04/26 新增）

**背景：** 从 100 分钟直播切 15 个片段，4.3GB 视频，用 FFmpeg。

**坑：**
- 管道 `cmd &` 后台会被终端工具拦截，不可用
- `nohup ffmpeg ... &` 也不行，被终端识别为不安全
- 单个 ffmpeg 任务超 600s 超时限制，必须分批或后台
- 用 `wait $!` 的管道方式会被系统在前台任务完成后杀死

**正确做法：**
```bash
# 方式1：分批前台执行（适合 5-10 个片段，每批总时长 < 600s）
ffmpeg -ss 21:00 -i "$SRC" -t 300 ... "$DST/02_xxx.mp4" && echo "完成"
ffmpeg -ss 26:00 -i "$SRC" -t 30 ... "$DST/03_xxx.mp4" && echo "完成"

# 方式2：terminal(background=true) + notify_on_complete（适合长任务）
terminal(command="ffmpeg ... && echo '完成'", background=true, notify_on_complete=true)

# 方式3：写脚本一次性前台顺序执行（超过 10 个片段时）
# 脚本内每个 ffmpeg 用 && 连接，确保失败不停
```

**实测数据（Mac 性能）：**
- 3min 片段：~30s 编码
- 7min 片段：~70s 编码
- 15 个片段总计：~15 分钟

**FFmpeg 参数选择：**
```bash
# 快速切割 + 合理画质（CRF 23，preset fast 够用）
ffmpeg -ss {start} -i video.mp4 -t {duration} \
  -c:v libx264 -preset fast -crf 23 \
  -c:a copy \
  output.mp4

# -ss 放在 -i 前面 = seek 到关键帧再解码（快）
# -c:a copy = 不重编码音频（省时间）
```

**监控进度：**
```bash
# 查看当前进度
ls -lh ~/tmp_clips/yoyo_styles/*.mp4 | wc -l
# 查看日志
cat ~/tmp_clips/yoyo_styles/cut_log.txt
```

### 飞书发送大文件失败的教训（2026/04/26 新增）

| 方式 | 结果 | 原因 |
|------|------|------|
| 飞书云盘 API | 🚫 Access denied | 缺少 `drive:file:upload` 权限 |
| IM API msg_type=video | 🚫 invalid msg_type | API 不支持 video 类型 |
| IM API msg_type=file（mp4 key）| 🚫 file type mismatch | 上传时的 file_type 与发送时的 msg_type 必须完全匹配 |
| IM API file_type=mp4 → msg_type=file | 🚫 file type mismatch | mp4 用 file type 上传后仍不能用 file 类型发 |
| transfer.sh / file.io | 🚫 连接失败 | 被墙 |
| ngrok / rclone | 🚫 未安装 | 环境限制 |

**可行替代方案：**
- 压缩到 <30MB 后尝试其他途径
- 用户回到电脑前直接查看文件
7. **超4GB大文件处理流程**（新发现，2026/04/25）：
   - mcp-video 工具最大只支持 4GB 文件，4.3GB 视频直接报 invalid_input
   - 改用 FFmpeg 抽帧 + subagent 视觉分析绕过限制：
     ```bash
     # 每30秒抽一帧（100分钟视频=200帧）
     for ts in $(seq 0 30 5400); do
       ffmpeg -ss $ts -i video.mp4 -vframes 1 -y "/tmp/frame_$(printf %04d $ts).jpg"
     done
     ```
   - 用 delegate_task 并行分析多帧（设置 max_iterations=30，工具集 vision+terminal+file）
   - 提示词要包含：视频路径、帧目录、任务目标、输出格式要求
   - 30秒间隔适合粗筛，再针对疑似切换点加密采样（如每5秒一帧）精确定位
6. **选片段必须验画面** — transcript 关键词只是候选，必须抽帧确认主播在展示产品才算有效片段
