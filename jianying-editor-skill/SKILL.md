---
name: jianying-editor-skill
description: Generate JianyingPro/CapCut draft folders on Mac that appear in the draft list. Creates draft_content.json + draft_meta_info.json, then adds all Mac-required supporting files.
tags: [jianying, capcut, mac, video-editing]
platforms: [macos]
---

# JianyingPro/CapCut 草稿生成 (Mac)

## 关键发现

**Mac CapCut 只认 `draft_content.json` + `draft_meta_info.json` 是不够的！** 必须在同一目录补充完整的 Mac 必需文件，否则草稿不会出现在 CapCut 草稿列表中。

---

## 完整文件清单（Mac CapCut 必须全部存在）

| 文件/文件夹 | 类型 | 说明 |
|------------|------|------|
| `draft_content.json` | 文件 | 素材+轨道数据 |
| `draft_meta_info.json` | 文件 | 草稿元信息 |
| `draft_info.json` | 文件 | **最关键** — 完整草稿信息（id/name/fps/duration/last_modified_platform） |
| `draft_settings` | 文件 | `[General]` 格式配置（**不是目录**） |
| `attachment_pc_common.json` | 文件 | 空结构 JSON |
| `Resources/` | 目录 | 空目录 |
| `common_attachment/` | 目录 | 空目录 |
| `matting/` | 目录 | 空目录 |
| `smart_crop/` | 目录 | 空目录 |

---

## draft_info.json 关键字段（❗ 容易出错的地方）

```python
{
    "canvas_config": {"width": 1080, "height": 1920, "ratio": "original"},
    "fps": 30.0,
    "duration": 0,
    "id": "<UUID>",
    "name": "",  # ❗ 必须为空字符串！不要写草稿名称
    "platform": {  # ❗ 必须是 dict，不是字符串 "mac"
        "app_id": 3704,
        "app_source": "lv",
        "app_version": "5.9.0",
        "os": "mac",
        "os_version": "15.7.5",
        "device_id": "b7e0901c24cde96c267ceb6a0787cd5c",  # 从工作草稿复制
        "hard_disk_id": "a693e420c4f4598ec002ce5dc1615c10",
        "mac_address": "9ce451a57ee1c922b745dbb022d91152"
    },
    "source": "default",  # ❗ 必须是 "default"，不是 "local"
    "last_modified_platform": {
        "app_id": 3704,
        "app_source": "lv",
        "app_version": "5.9.0",
        "os": "mac",
        "os_version": "15.7.5",
        "device_id": "b7e0901c24cde96c267ceb6a0787cd5c",  # 从工作草稿复制
        "hard_disk_id": "a693e420c4f4598ec002ce5dc1615c10",
        "mac_address": "9ce451a57ee1c922b745dbb022d91152"
    },
    "materials": <从draft_content.json>,
    "tracks": <从draft_content.json>,
}
```

### 常见错误及症状
| 错误 | 症状 |
|------|------|
| `platform` 写成字符串 `"mac"` | CapCut 显示「暂无访问权限」|
| `source` 写成 `"local"` | 草稿不显示 |
| `name` 写了草稿名称（非空字符串） | 可能影响识别，**必须为空字符串** |

---

## 完整生成步骤

```python
import json
import os
import time

draft_dir = "/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/草稿名称"
os.makedirs(draft_dir, exist_ok=True)

# 1. 已有 draft_content.json + draft_meta_info.json（skill生成）

# 2. 构建 draft_info.json（Mac CapCut 必须）
draft_content = json.load(open(f"{draft_dir}/draft_content.json"))

draft_info = {
    "canvas_config": draft_content.get("canvas_config"),
    "color_space": -1,
    "config": {...},  # 标准 config 对象
    "duration": draft_content.get("duration", 0),
    "fps": draft_content.get("fps", 30.0),
    "id": "<新UUID>",
    "name": "草稿名称",
    "last_modified_platform": {
        "app_id": 3704,
        "app_source": "lv",
        "app_version": "5.9.0",
        "os": "mac",
        "os_version": "15.7.5"
    },
    "materials": draft_content.get("materials", {}),
    "tracks": draft_content.get("tracks", []),
    "version": "6.0.0"
}

with open(f"{draft_dir}/draft_info.json", "w") as f:
    json.dump(draft_info, f, ensure_ascii=False)

# 3. 创建目录
for folder in ["Resources", "common_attachment", "matting", "smart_crop"]:
    os.makedirs(f"{draft_dir}/{folder}", exist_ok=True)

# 4. 创建 draft_settings（文件，非目录！）
draft_settings_content = f"""[General]
cloud_last_modify_platform=mac
draft_create_time={int(time.time())}
draft_last_edit_time={int(time.time())}
real_edit_keys=1
real_edit_seconds=0
"""
with open(f"{draft_dir}/draft_settings", "w") as f:
    f.write(draft_settings_content)

# 5. 创建 attachment_pc_common.json
attachment_pc_common = {
    "ai_packaging_infos": [],
    "ai_packaging_report_info": {
        "caption_id_list": [],
        "task_id": "",
        "text_style": "",
        "tos_id": "",
        "video_category": ""
    },
    "commercial_music_category_ids": [],
    "pc_feature_flag": 0,
    "recognize_tasks": [],
    "template_item_infos": [],
    "unlock_template_ids": []
}
with open(f"{draft_dir}/attachment_pc_common.json", "w") as f:
    json.dump(attachment_pc_common, f)
```

---

## 调试：如果草稿显示「暂无访问权限」

**最可能原因：`draft_info.json` 的 `platform` 字段格式错误**

```python
# ❌ 错误：platform 是字符串
"platform": "mac"

# ✅ 正确：platform 是包含 app 信息的 dict
"platform": {
    "app_id": 3704,
    "app_source": "lv",
    "app_version": "5.9.0",
    "os": "mac",
    ...
}
```

**调试步骤：**

1. 对比工作正常的草稿：
   ```bash
   ls -la "/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/书亦_03C片段测试/"
   ```

2. 检查 `root_meta_info.json` 是否包含该草稿：
   ```python
   import json
   with open("/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/root_meta_info.json") as f:
       d = json.load(f)
   # 草稿应出现在 all_draft_store 列表中
   ```

3. 确认 `draft_info.json` 中 `platform` 是 dict，`source` 是 `"default"`

---

## 绕过 CapCut 导出限制：用 FFmpeg 直接提取草稿片段

如果不需要 CapCut 的特效/字幕，只提取原始片段，可以用 FFmpeg 直接从 `draft_content.json` 获取视频路径和时间范围：

```python
import json

draft_dir = "/path/to/草稿"
with open(f"{draft_dir}/draft_content.json") as f:
    content = json.load(f)

# 获取视频路径和时长
videos = content["materials"]["videos"]
video_path = videos[0]["path"]  # 原始视频路径

# 从轨道获取时间范围（duration 单位是微秒）
tracks = content["tracks"]
video_track = next(t for t in tracks if t["type"] == "video")
segment = video_track["segments"][0]
time_range = segment["target_timerange"]
start_us = time_range["start"]
duration_us = time_range["duration"]
duration_sec = duration_us / 1_000_000
start_sec = start_us / 1_000_000

print(f"从 {start_sec:.1f}s 开始，时长 {duration_sec:.1f}s")
```

```bash
# FFmpeg 提取命令
ffmpeg -y -i "$VIDEO_PATH" \
  -ss $START_SEC -t $DURATION_SEC \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac \
  "$OUTPUT.mp4"
```

## ⚠️ 崩溃根因：source_timerange 缺失（最常见崩溃原因）

**症状**：CapCut 一打开草稿就崩溃（闪退）

**根因**：`draft_content.json` 的视频 segment 缺少 `source_timerange` 字段，CapCut 不知道从源视频的哪里截取，导致崩溃。

```python
# ❌ 错误：只有 target_timerange，缺少 source_timerange
"segments": [{
    "material_id": "...",
    "target_timerange": {"start": 0, "duration": 180000000},
    # source_timerange 缺失 → 崩溃
}]

# ✅ 正确：两个 timerange 都要有
"segments": [{
    "material_id": "...",
    "target_timerange": {"start": 0, "duration": 180000000},   # 草稿时间线（总是从0开始）
    "source_timerange": {"start": 180000000, "duration": 180000000},  # 源视频截取位置
}]
```

| 字段 | 作用 |
|------|------|
| `materials.videos[].duration` | **源视频完整时长**（如100分钟=6029432000微秒），不是片段时长 |
| `tracks[].segments[].target_timerange.start` | 草稿时间线起点（**总是0**）|
| `tracks[].segments[].target_timerange.duration` | 片段在草稿中的时长 |
| `tracks[].segments[].source_timerange.start` | **源视频截取起点**（关键！）|
| `tracks[].segments[].source_timerange.duration` | **源视频截取长度** |

### 大视频文件（4GB+）可能导致额外问题
- 4.3GB / 100分钟 / 60fps 源文件在 CapCut 外部引用时可能不稳定
- 建议先用 FFmpeg 预切割成小片段，再生成草稿引用小片段

## 限制（Mac）

| 功能 | 状态 | 说明 |
|------|------|------|
| 草稿生成 | ✅ | 完全支持 |
| CapCut 手动导出 | ✅ | 用户点击导出按钮 |
| 自动导出 | ❌ | Mac CapCut 无 CLI/API |
| FFmpeg 提取片段 | ✅ | 绕过方案，直接从原视频提取 |
| AI高光识别 | ❌ | **不是本skill范围**，需先用 Whisper + LLM 分析 |

## 完整工作流：Whisper转写 → AI高光分析 → CapCut草稿生成

jianying skill **只负责生成草稿文件夹**，不负责 AI 分析高光。完整流程：

```
原视频(100分钟)
    ↓
① Whisper转写 → SRT字幕
    ↓
② AI分析SRT → 识别"强Hook时间戳"
    （关键词：价格数字/产品对比/引导词/限量紧迫）
    ↓
③ jianying skill → 每个高光片段生成一个CapCut草稿
    ↓
用户打开Mac CapCut → 草稿列表 → 手动导出MP4
```

### ② AI高光识别逻辑（电商直播场景）

```python
def score_hook(text):
    score = 0
    # 强Hook: 价格+折扣
    if any(w in text for w in ['一折', '两折', '半价', '只要', '138', '158', '88']):
        score += 10
    # 克重重磅
    if any(w in text for w in ['350克', '300克', '200克', '克重']):
        score += 8
    # 强动作词（引导下单）
    if any(w in text for w in ['上车', '拍', '扣1', '抢', '加购', '库存']):
        score += 8
    # 产品对比
    if any(w in text for w in ['不变形', '不掉色', '万针', '压胶', '纯棉']):
        score += 6
    # 品牌/品质
    if any(w in text for w in ['质感', '品牌', '情侣', '高级']):
        score += 4
    # 紧迫感
    if any(w in text for w in ['最后', '限量', '就这一波', '错过']):
        score += 6
    return score
```

### 批量生成多个草稿的完整脚本

```python
import json, os, time, uuid, re

DRAFT_BASE = "/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft"
SOURCE_VIDEO = "/path/to/source.mp4"
SRT_FILE = "/tmp/transcription.srt"

def parse_srt(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    entries = []
    for block in content.strip().split('\n\n'):
        lines = block.split('\n')
        if len(lines) >= 3:
            m = re.match(r'(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})', lines[1])
            if m:
                def to_us(t):
                    h,M,s = t.split(':')
                    return int(h)*3600*1000000 + int(M)*60*1000000 + int(s)*1000000
                entries.append({'start_us': to_us(m.group(1)), 'end_us': to_us(m.group(3)), 'text': '\n'.join(lines[2:]).strip()})
    return entries

srt_entries = parse_srt(SRT_FILE)

def get_subs(start_s, end_s, entries):
    return [e for e in entries if start_s*1000000 <= e['start_us'] <= end_s*1000000]

# 从工作草稿复制 device_id 等信息
ref_info = json.load(open("/path/to/书亦_03C片段测试/draft_info.json"))
ref_dev = ref_info['last_modified_platform']['device_id']
ref_hdd = ref_info['last_modified_platform']['hard_disk_id']
ref_mac = ref_info['last_modified_platform']['mac_address']

# (开始秒, 结束秒, 草稿名称)
clips = [
    (180, 360, "YoYo_01_价格开场"),
    (480, 660, "YoYo_02_产品介绍"),
    # ...更多片段
]

for start_s, end_s, name in clips:
    dur_s = end_s - start_s
    dur_us = dur_s * 1000000
    draft_dir = f"{DRAFT_BASE}/{name}"
    os.makedirs(draft_dir, exist_ok=True)

    draft_id = str(uuid.uuid4()).upper()
    subs = get_subs(start_s, end_s, srt_entries)

    vid_mat_id = str(uuid.uuid4()).replace('-', '')[:24]
    vid_track_id = str(uuid.uuid4()).replace('-', '')[:24]
    txt_track_id = str(uuid.uuid4()).replace('-', '')[:24]

    # 构建字幕轨道
    text_segs = []
    for sub in subs[:15]:
        text_segs.append({
            'material_id': str(uuid.uuid4()).replace('-', '')[:24],
            'target_timerange': {'start': sub['start_us'] - start_s*1000000, 'duration': sub['end_us'] - sub['start_us']},
            'speed': 1.0,
            'duration': sub['end_us'] - sub['start_us'],
            'segment_index': 0,
            'content': {'text': sub['text'], 'style': {'font_size': 48, 'color': '#FFFFFF', 'background_color': '#00000080', 'alignment': 1}}
        })

    content = {
        'canvas_config': {'width': 1080, 'height': 1920, 'ratio': 'original'},
        'fps': 30.0, 'duration': dur_us,
        'config': {'maintrack_adsorb': True},
        'materials': {
            'videos': [{'id': vid_mat_id, 'material_id': vid_mat_id, 'path': SOURCE_VIDEO, 'duration': dur_us, 'width': 1080, 'height': 1920, 'type': 'video', 'speed': 1.0, 'crop': {'upper_left_x': 0.0, 'upper_left_y': 0.0, 'upper_right_x': 1.0, 'upper_right_y': 0.0, 'lower_left_x': 0.0, 'lower_left_y': 1.0, 'lower_right_x': 1.0, 'lower_right_y': 1.0}}],
            'texts': [{'id': str(uuid.uuid4()).replace('-', '')[:24], 'material_id': str(uuid.uuid4()).replace('-', '')[:24], 'text': '', 'duration': dur_us, 'type': 'text'}]
        },
        'tracks': [
            {'id': vid_track_id, 'type': 'video', 'segments': [{'material_id': vid_mat_id, 'target_timerange': {'start': 0, 'duration': dur_us}, 'source_timerange': {'start': start_s * 1000000, 'duration': dur_us}, 'speed': 1.0, 'duration': dur_us, 'segment_index': 0}]},
            {'id': txt_track_id, 'type': 'text', 'segments': text_segs if text_segs else [{'material_id': '', 'target_timerange': {'start': 0, 'duration': dur_us}, 'speed': 1.0, 'duration': dur_us, 'segment_index': 0, 'content': {'text': '字幕'}}]}
        ]
    }

    json.dump(content, open(f'{draft_dir}/draft_content.json', 'w'), ensure_ascii=False, indent=4)
    json.dump({'draft_name': name, 'draft_fold_path': draft_dir, 'draft_id': draft_id, 'create_time': int(time.time()), 'update_time': int(time.time()), 'draft_content_version': '6.0.0'}, open(f'{draft_dir}/draft_meta_info.json', 'w'), ensure_ascii=False)

    draft_info = {
        'canvas_config': {'width': 1080, 'height': 1920, 'ratio': 'original'}, 'fps': 30.0, 'duration': dur_us, 'id': draft_id, 'name': '',
        'platform': ref_info['platform'], 'source': 'default',
        'last_modified_platform': {'app_id': 3704, 'app_source': 'lv', 'app_version': '5.9.0', 'device_id': ref_dev, 'hard_disk_id': ref_hdd, 'mac_address': ref_mac, 'os': 'mac', 'os_version': '15.7.5'},
        'materials': content['materials'], 'tracks': content['tracks'], 'version': '6.0.0'
    }
    json.dump(draft_info, open(f'{draft_dir}/draft_info.json', 'w'), ensure_ascii=False, indent=4)

    for folder in ['Resources', 'common_attachment', 'matting', 'smart_crop']:
        os.makedirs(f'{draft_dir}/{folder}', exist_ok=True)

    json.dump({'ai_packaging_infos': [], 'ai_packaging_report_info': {'caption_id_list': [], 'task_id': '', 'text_style': '', 'tos_id': '', 'video_category': ''}, 'commercial_music_category_ids': [], 'pc_feature_flag': 0, 'recognize_tasks': [], 'template_item_infos': [], 'unlock_template_ids': []}, open(f'{draft_dir}/attachment_pc_common.json', 'w'))

    with open(f'{draft_dir}/draft_settings', 'w') as f:
        f.write(f'[General]\ncloud_last_modify_platform=mac\ndraft_create_time={int(time.time())}\ndraft_last_edit_time={int(time.time())}\nreal_edit_keys=1\nreal_edit_seconds={dur_s}\n')

# 注册到 root_meta_info.json
root = json.load(open(f"{DRAFT_BASE}/root_meta_info.json")) if os.path.exists(f"{DRAFT_BASE}/root_meta_info.json") else {'all_draft_store': [], 'draft_ids': 0, 'root_path': DRAFT_BASE}
for start_s, end_s, name in clips:
    root['all_draft_store'].append({'draft_name': name, 'draft_fold_path': f"{DRAFT_BASE}/{name}", 'draft_id': str(uuid.uuid4()).upper(), 'update_time': int(time.time())})
root['draft_ids'] = len(root['all_draft_store'])
json.dump(root, open(f"{DRAFT_BASE}/root_meta_info.json", 'w'), ensure_ascii=False, indent=4)

print(f'✅ 已生成 {len(clips)} 个草稿')
```

## 参考草稿

工作正常的草稿路径：
`/Users/yehya/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/书亦_03C片段测试/`
