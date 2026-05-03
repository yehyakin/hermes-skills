"""
示例：电商视频转短切片流水线

用法：
    python shortform_pipeline.py --input video.mp4 --min-duration 30 --max-clips 10
    
功能：
    1. Whisper 转写音频
    2. 基于 SRT 挖掘爆点时间戳
    3. FFmpeg 精剪视频片段
    4. PIL 字幕包装
"""

import argparse
import subprocess
import os
import json
from pathlib import Path


def extract_audio(video_path: str, output_path: str = None) -> str:
    """从视频提取音频"""
    if output_path is None:
        output_path = str(Path(video_path).with_suffix(".wav"))
    
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        output_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def transcribe_audio(audio_path: str, output_json: str = None) -> dict:
    """用 Whisper 转写音频"""
    if output_json is None:
        output_json = str(Path(audio_path).with_suffix(".json"))
    
    # 检查 whisper 是否可用
    try:
        import whisper
    except ImportError:
        print("请安装 whisper: pip install openai-whisper")
        return {}
    
    print("🎙️ 正在加载 Whisper 模型...")
    model = whisper.load_model("base")
    
    print("📝 正在转写音频...")
    result = model.transcribe(audio_path, language="zh", task="translate")
    
    # 保存结果
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return result


def find_highlights(transcript_json: str, min_duration: int = 30) -> list:
    """基于转写结果挖掘爆点"""
    with open(transcript_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    highlights = []
    for segment in data.get("segments", []):
        text = segment["text"].strip()
        
        # 爆点关键词
        trigger_words = [
            "秒杀", "限时", "特价", "优惠", "折扣",
            "爆款", "必买", "推荐", "种草", "回购",
            "上身", "试穿", "效果", "好看", "显瘦"
        ]
        
        if any(word in text for word in trigger_words):
            highlights.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": text,
                "duration": segment["end"] - segment["start"]
            })
    
    # 合并相邻片段
    merged = []
    for h in highlights:
        if merged and h["start"] - merged[-1]["end"] < 5:
            merged[-1]["end"] = h["end"]
            merged[-1]["text"] += " " + h["text"]
            merged[-1]["duration"] = merged[-1]["end"] - merged[-1]["start"]
        else:
            merged.append(h.copy())
    
    # 过滤时长
    filtered = [h for h in merged if h["duration"] >= min_duration]
    
    return filtered[:10]  # 最多10个片段


def clip_video(video_path: str, highlight: dict, output_path: str) -> str:
    """FFmpeg 精剪视频片段"""
    cmd = [
        "ffmpeg", "-y", "-ss", str(highlight["start"]),
        "-i", video_path, "-t", str(highlight["duration"]),
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        output_path
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def add_subtitle(video_path: str, subtitle_text: str, output_path: str) -> str:
    """添加字幕（简单实现）"""
    # 这里应该用 PIL 或 ffmpeg drawtext 实现
    # 简化示例
    return video_path


def main():
    parser = argparse.ArgumentParser(description="电商视频转短切片流水线")
    parser.add_argument("--input", required=True, help="输入视频路径")
    parser.add_argument("--min-duration", type=int, default=30, help="最小片段时长（秒）")
    parser.add_argument("--max-clips", type=int, default=10, help="最大剪辑数")
    parser.add_argument("--output-dir", default="./output", help="输出目录")
    
    args = parser.parse_args()
    
    video_path = args.input
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    
    print("="*60)
    print("🎬 电商视频转短切片流水线")
    print("="*60)
    
    # Step 1: 提取音频
    print("\n📌 Step 1: 提取音频...")
    audio_path = extract_audio(video_path)
    print(f"   音频已保存: {audio_path}")
    
    # Step 2: Whisper 转写
    print("\n📌 Step 2: Whisper 转写...")
    transcript_json = transcribe_audio(audio_path)
    print(f"   转写已保存: {transcript_json}")
    print(f"   识别文字: {transcript_json.get('text', '')[:100]}...")
    
    # Step 3: 挖掘爆点
    print("\n📌 Step 3: 挖掘爆点...")
    highlights = find_highlights(transcript_json, args.min_duration)
    print(f"   发现 {len(highlights)} 个潜在爆点片段")
    
    for i, h in enumerate(highlights, 1):
        print(f"   {i}. [{h['start']:.1f}s - {h['end']:.1f}s] {h['text'][:40]}...")
    
    # Step 4: 精剪片段
    print("\n📌 Step 4: 精剪视频片段...")
    output_clips = []
    for i, h in enumerate(highlights[:args.max_clips], 1):
        output_path = str(output_dir / f"clip_{i:02d}.mp4")
        clip_path = clip_video(video_path, h, output_path)
        output_clips.append(clip_path)
        print(f"   ✓ 片段 {i}: {clip_path}")
    
    print("\n" + "="*60)
    print(f"✅ 流水线完成！共生成 {len(output_clips)} 个切片")
    print("="*60)


if __name__ == "__main__":
    main()
