#!/usr/bin/env python3
"""
剪映草稿生成器
用法: python3 generate_draft.py <视频文件> <输出目录> [片段列表]
片段列表格式: start1-end1,start2-end2,...
示例: python3 generate_draft.py input.mp4 ./draft 5.0-35.0,120.5-180.3
"""

import json
import os
import sys
import hashlib
import shutil
import subprocess
from datetime import datetime

def get_video_duration(filepath):
    """获取视频时长（毫秒）"""
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'json',
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    return int(float(data['format']['duration']) * 1000)

def get_video_info(filepath):
    """获取视频信息"""
    cmd = [
        'ffprobe', '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate',
        '-of', 'json',
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    stream = data['streams'][0]
    w = stream['width']
    h = stream['height']
    fps = stream['r_frame_rate']
    # fps 可能是 "30/1" 格式
    if '/' in fps:
        num, den = fps.split('/')
        fps_val = int(num) / int(den)
    else:
        fps_val = int(fps)
    return w, h, fps_val

def gen_id(prefix, name):
    """生成素材ID"""
    h = hashlib.md5(name.encode()).hexdigest()[:8]
    return f"{prefix}_{h}"

def parse_timestamps(timestamps_str):
    """解析时间戳字符串"""
    fragments = []
    for part in timestamps_str.split(','):
        part = part.strip()
        if '-' in part:
            start, end = part.split('-')
            start_ms = int(float(start.strip()) * 1000)
            end_ms = int(float(end.strip()) * 1000)
            if end_ms > start_ms:
                fragments.append((start_ms, end_ms))
    return fragments

def extract_clips(video_path, output_dir, fragments):
    """提取视频片段"""
    os.makedirs(os.path.join(output_dir, 'local_projects'), exist_ok=True)
    
    clips = []
    for i, (start_ms, end_ms) in enumerate(fragments):
        # 生成唯一文件名
        video_hash = hashlib.md5(f"{video_path}{start_ms}".encode()).hexdigest()[:8]
        clip_filename = f"material_video_{video_hash}.mp4"
        clip_path = os.path.join(output_dir, 'local_projects', clip_filename)
        
        # FFmpeg 提取
        duration_ms = end_ms - start_ms
        cmd = [
            'ffmpeg', '-y', '-i', video_path,
            '-ss', str(start_ms / 1000),
            '-t', str(duration_ms / 1000),
            '-c', 'copy',
            clip_path
        ]
        print(f"提取片段 {i+1}: {start_ms/1000:.1f}s - {end_ms/1000:.1f}s")
        subprocess.run(cmd, capture_output=True)
        
        if os.path.exists(clip_path):
            clips.append({
                'index': i,
                'filename': clip_filename,
                'path': clip_path,
                'start_ms': start_ms,
                'end_ms': end_ms,
                'duration_ms': duration_ms,
                'video_id': gen_id('video', clip_filename)
            })
    
    return clips

def generate_draft_json(video_path, output_dir, clips):
    """生成剪映草稿JSON"""
    
    # 读取一个clip获取视频信息
    sample_clip = clips[0]
    w, h, fps = get_video_info(sample_clip['path'])
    
    # 构建素材列表
    videos = []
    for clip in clips:
        videos.append({
            'id': clip['video_id'],
            'path': f"local_projects/{clip['filename']}",
            'duration': clip['duration_ms'],
            'width': w,
            'height': h,
            'fps': fps
        })
    
    # 构建轨道
    current_time = 0
    tracks = []
    video_track = {
        'type': 'video',
        'id': gen_id('track', 'main_video'),
        'clips': []
    }
    
    for clip in clips:
        video_track['clips'].append({
            'material_id': clip['video_id'],
            'start_time': current_time,
            'end_time': current_time + clip['duration_ms'],
            'source_timerange': {
                'start': clip['start_ms'],
                'duration': clip['duration_ms']
            }
        })
        current_time += clip['duration_ms']
    
    tracks.append(video_track)
    
    # 完整草稿结构
    draft = {
        'type': 'draft',
        'version': '1.0.0',
        'materials': {
            'videos': videos
        },
        'tracks': tracks,
        'duration': current_time
    }
    
    return draft

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    video_path = sys.argv[1]
    output_base = sys.argv[2]
    timestamps_str = sys.argv[3] if len(sys.argv) > 3 else "0-10"
    
    if not os.path.exists(video_path):
        print(f"错误: 视频文件不存在: {video_path}")
        sys.exit(1)
    
    # 创建输出目录
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = os.path.join(output_base, ts)
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"视频: {video_path}")
    print(f"输出: {output_dir}")
    
    # 解析时间戳
    fragments = parse_timestamps(timestamps_str)
    print(f"片段数: {len(fragments)}")
    
    if not fragments:
        print("错误: 没有有效的片段")
        sys.exit(1)
    
    # 提取片段
    clips = extract_clips(video_path, output_dir, fragments)
    
    # 生成草稿JSON
    draft = generate_draft_json(video_path, output_dir, clips)
    
    # 写入文件
    draft_content_path = os.path.join(output_dir, 'draft_content.json')
    with open(draft_content_path, 'w', encoding='utf-8') as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)
    
    # 生成 project.json（剪映需要）
    project = {
        'draft_id': gen_id('draft', ts),
        'create_time': ts,
        'update_time': ts,
        'draft_name': f"导出_{ts}",
        'draft_content_path': 'draft_content.json'
    }
    project_path = os.path.join(output_dir, 'project.json')
    with open(project_path, 'w', encoding='utf-8') as f:
        json.dump(project, f, ensure_ascii=False, indent=2)
    
    print(f"\n草稿生成完成!")
    print(f"📁 {output_dir}")
    print(f"\n在 Mac 上用剪映打开这个文件夹即可编辑")
    
    return output_dir

if __name__ == '__main__':
    main()
