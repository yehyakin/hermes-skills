"""
示例：获取抖音视频信息

用法：
    python fetch_video_info.py "https://v.douyin.com/xxxxx"

输出：
    视频标题、作者、时长、话题、下载链接
"""

import sys
import json
import subprocess
import os

# 配置路径
HERMES_VENV_PYTHON = "/Users/yehya/.hermes-guardian/venv/bin/python3"
DOUYIN_GET_SCRIPT = os.path.expanduser("~/.hermes/scripts/douyin_get.py")


def fetch_video_info(url: str, use_json: bool = False) -> dict:
    """
    获取抖音视频信息
    
    Args:
        url: 抖音分享链接
        use_json: 是否使用 JSON 格式输出
    
    Returns:
        dict: 包含 title, author, duration, hashtags 等字段
    """
    cmd = [HERMES_VENV_PYTHON, DOUYIN_GET_SCRIPT, url]
    if use_json:
        cmd.append("--json")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            if use_json:
                return json.loads(result.stdout)
            else:
                print(result.stdout)
                return {}
        else:
            print(f"获取失败: {result.stderr}")
            return {}
    except subprocess.TimeoutExpired:
        print("获取超时，请检查网络或链接是否有效")
        return {}
    except FileNotFoundError:
        print(f"脚本未找到: {DOUYIN_GET_SCRIPT}")
        print("请确保 videodl 已正确安装")
        return {}


def download_video(url: str, output_dir: str = ".") -> str:
    """
    下载抖音视频
    
    Args:
        url: 抖音分享链接
        output_dir: 输出目录
    
    Returns:
        str: 下载后的文件路径
    """
    # Step 1: 获取 download_url
    info = fetch_video_info(url, use_json=True)
    if not info or "download_url" not in info:
        print("无法获取下载链接")
        return None
    
    download_url = info["download_url"]
    
    # Step 2: 用 yt-dlp 下载
    output_template = os.path.join(output_dir, "%(title)s.%(ext)s")
    cmd = [
        "yt-dlp",
        "-o", output_template,
        "--add-header", "User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "--add-header", "Referer:https://www.douyin.com/",
        download_url
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print(f"下载完成: {result.stdout}")
            return result.stdout.strip().split("\n")[-1]
        else:
            print(f"下载失败: {result.stderr}")
            return None
    except FileNotFoundError:
        print("yt-dlp 未安装，请运行: pip install yt-dlp")
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python fetch_video_info.py <抖音链接>")
        sys.exit(1)
    
    url = sys.argv[1]
    
    print(f"📥 正在获取视频信息: {url}\n")
    
    # 获取信息（文本格式）
    fetch_video_info(url, use_json=False)
    
    print("\n" + "="*50)
    print("💡 如需下载，请调用 download_video(url)")
