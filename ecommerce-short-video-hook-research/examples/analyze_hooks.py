"""
示例：电商短视频钩子研究

用法：
    python analyze_hooks.py --platform youtube --keyword "men's fashion haul"
    
功能：
    1. 搜索高播放量的带货教程视频
    2. 分析视频前 30 秒的钩子写法
    3. 提取可复用的钩子模式
"""

import argparse
import json
import re
from typing import List, Dict


# 常见电商短视频钩子模式
HOOK_PATTERNS = {
    "problem_agitation": {
        "name": "问题 agitation 型",
        "description": "先提出痛点问题，引起共鸣",
        "examples": [
            "不会搭配？学会这3招就够了",
            "为什么你穿西装像中介？",
            "矮个子男生显高必看"
        ]
    },
    "price_shock": {
        "name": "价格 shock 型",
        "description": "超低价格或超值性价比吸引眼球",
        "examples": [
            "99 元买到的奢侈品品质",
            "这套穿搭只要 200 块",
            "原价 500 的衬衫现在只要..."
        ]
    },
    "curiosity_gap": {
        "name": "好奇心 gap 型",
        "description": "制造信息差，激发好奇心",
        "examples": [
            "千万别买这家的衣服，因为...",
            "直播间不会告诉你的秘密",
            "这个穿搭雷区 90% 的人都踩过"
        ]
    },
    "social_proof": {
        "name": "社会证明型",
        "description": "借助他人背书或数据证明",
        "examples": [
            "10000+ 人已经购买",
            "明星同款，穿上显瘦10斤",
            "回购率 90% 的爆款"
        ]
    },
    "authority": {
        "name": "权威型",
        "description": "专业身份或场景背书",
        "examples": [
            "作为 10 年服装设计师...",
            "在米兰时装周学到的搭配",
            "教你一眼识别质量问题"
        ]
    },
    "urgency": {
        "name": "紧迫感型",
        "description": "限时限量制造紧迫感",
        "examples": [
            "仅剩最后 100 件",
            "今晚直播间下架",
            "错过等一年"
        ]
    }
}


def search_videos(platform: str, keyword: str, max_results: int = 10) -> List[Dict]:
    """
    搜索视频（示例实现）
    
    Args:
        platform: 平台名称 (youtube, douyin, xiaohongshu)
        keyword: 搜索关键词
        max_results: 最大结果数
    
    Returns:
        List[Dict]: 视频信息列表
    """
    # 这里是示例实现，实际应调用对应平台 API
    print(f"🔍 在 {platform} 搜索: {keyword}")
    
    # 模拟返回结果
    mock_results = [
        {
            "title": "MEN'S FASHION HAUL | 5 Pieces Under $100",
            "url": "https://youtube.com/watch?v=xxx",
            "views": 125000,
            "duration": 180,
            "published_at": "2024-01-15"
        },
        {
            "title": "How to Style Basic T-Shirts (Men's Fashion Tips)",
            "url": "https://youtube.com/watch?v=yyy",
            "views": 89000,
            "duration": 420,
            "published_at": "2024-01-10"
        }
    ]
    
    return mock_results[:max_results]


def analyze_hook_pattern(title: str) -> str:
    """
    分析标题匹配哪种钩子模式
    
    Args:
        title: 视频标题
    
    Returns:
        str: 匹配的钩子模式名称
    """
    title_lower = title.lower()
    
    for pattern_id, pattern in HOOK_PATTERNS.items():
        for example in pattern["examples"]:
            if any(word in title_lower for word in example.lower().split()):
                return pattern["name"]
    
    return "未分类"


def generate_hook_report(videos: List[Dict]) -> Dict:
    """
    生成钩子分析报告
    
    Args:
        videos: 视频列表
    
    Returns:
        Dict: 分析报告
    """
    report = {
        "total_analyzed": len(videos),
        "pattern_distribution": {},
        "top_hooks": [],
        "recommendations": []
    }
    
    for video in videos:
        pattern = analyze_hook_pattern(video["title"])
        report["pattern_distribution"][pattern] = \
            report["pattern_distribution"].get(pattern, 0) + 1
        
        if len(report["top_hooks"]) < 5:
            report["top_hooks"].append({
                "title": video["title"],
                "views": video["views"],
                "pattern": pattern
            })
    
    # 生成建议
    most_common = max(report["pattern_distribution"].items(), key=lambda x: x[1])
    report["recommendations"].append(
        f"当前最流行的钩子类型是「{most_common[0]}」，建议优先使用"
    )
    
    return report


def main():
    parser = argparse.ArgumentParser(description="电商短视频钩子研究工具")
    parser.add_argument("--platform", default="youtube", choices=["youtube", "douyin", "xiaohongshu"])
    parser.add_argument("--keyword", required=True, help="搜索关键词")
    parser.add_argument("--max-results", type=int, default=10)
    
    args = parser.parse_args()
    
    print("="*60)
    print("🛒 电商短视频钩子研究工具")
    print("="*60 + "\n")
    
    # Step 1: 搜索视频
    videos = search_videos(args.platform, args.keyword, args.max_results)
    print(f"\n✅ 找到 {len(videos)} 个视频\n")
    
    # Step 2: 分析钩子模式
    for video in videos:
        pattern = analyze_hook_pattern(video["title"])
        print(f"📌 [{pattern}] {video['title']}")
    
    # Step 3: 生成报告
    report = generate_hook_report(videos)
    
    print("\n" + "="*60)
    print("📊 钩子模式分析报告")
    print("="*60)
    
    print(f"\n分析的标题总数: {report['total_analyzed']}")
    print("\n钩子类型分布:")
    for pattern, count in report["pattern_distribution"].items():
        bar = "█" * count
        print(f"  {pattern}: {bar} ({count})")
    
    print("\n高播放量标题 TOP5:")
    for i, hook in enumerate(sorted(report["top_hooks"], key=lambda x: x["views"], reverse=True), 1):
        print(f"  {i}. [{hook['pattern']}] {hook['title'][:40]}... ({hook['views']:,} views)")
    
    print("\n💡 建议:")
    for rec in report["recommendations"]:
        print(f"  • {rec}")


if __name__ == "__main__":
    main()
