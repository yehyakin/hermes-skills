"""
示例：内容资产复利化工具

用法：
    python content_manager.py --action record_topic --content "夏季男装穿搭技巧"
    
功能：
    1. 记录选题
    2. 深化选题
    3. 检索素材
    4. 记录数据
"""

import argparse
import os
from pathlib import Path
from datetime import datetime


# 项目根目录
PROJECT_ROOT = Path("~/content-fuoli").expanduser()


def ensure_dirs():
    """确保项目目录结构存在"""
    dirs = [
        "01-选题管理",
        "02-话术生产/直播话术",
        "02-话术生产/短视频脚本",
        "02-话术生产/图文内容",
        "02-话术生产/模板",
        "03-素材库/核心概念库",
        "03-素材库/金句库",
        "03-素材库/爆款话术库",
        "03-素材库/案例库",
        "04-数据复盘",
        "05-方法论沉淀",
        "06-竞品监控",
    ]
    
    for d in dirs:
        (PROJECT_ROOT / d).mkdir(parents=True, exist_ok=True)


def record_topic(content: str, source: str = None) -> str:
    """记录选题"""
    ensure_dirs()
    
    date = datetime.now().strftime("%Y%m%d")
    filename = f"{PROJECT_ROOT}/01-选题管理/00-选题记录.md"
    
    entry = f"""
## {date} - {content[:50]}

- **内容**: {content}
- **来源**: {source or '直接提供'}
- **日期**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
- **状态**: 待深化

---
"""
    
    with open(filename, "a", encoding="utf-8") as f:
        f.write(entry)
    
    # 同时创建待深化文件
    topic_file = f"{PROJECT_ROOT}/01-选题管理/01-待深化/{date}-{content[:20]}.md"
    with open(topic_file, "w", encoding="utf-8") as f:
        f.write(f"# {content}\n\n**创建日期**: {datetime.now().strftime('%Y-%m-%d')}\n\n## 选题背景\n\n## 待解决问题\n\n## 执行计划\n")
    
    return f"✅ 选题已记录: {topic_file}"


def search_content(keyword: str) -> list:
    """检索素材"""
    results = []
    
    # 搜索素材库
    material_dirs = [
        PROJECT_ROOT / "03-素材库/核心概念库",
        PROJECT_ROOT / "03-素材库/金句库",
        PROJECT_ROOT / "03-素材库/爆款话术库",
        PROJECT_ROOT / "02-话术生产",
    ]
    
    for dir_path in material_dirs:
        if not dir_path.exists():
            continue
        
        for md_file in dir_path.rglob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8")
                if keyword in content:
                    results.append({
                        "file": str(md_file),
                        "preview": content[:200],
                        "type": md_file.parent.name
                    })
            except:
                pass
    
    return results


def record_data(content_type: str, metrics: dict) -> str:
    """记录数据"""
    ensure_dirs()
    
    date = datetime.now().strftime("%Y%m%d")
    filename = f"{PROJECT_ROOT}/04-数据复盘/内容数据表.md"
    
    entry = f"""
## {date} - {content_type}

| 指标 | 数值 |
|------|------|
"""
    for key, value in metrics.items():
        entry += f"| {key} | {value} |\n"
    
    entry += f"""
- **记录时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
- **状态**: 正常

---
"""
    
    with open(filename, "a", encoding="utf-8") as f:
        f.write(entry)
    
    return f"✅ 数据已记录"


def main():
    parser = argparse.ArgumentParser(description="内容资产复利化管理工具")
    parser.add_argument("--action", required=True, 
                       choices=["record_topic", "search", "record_data"],
                       help="操作类型")
    parser.add_argument("--content", help="内容/选题")
    parser.add_argument("--source", help="来源")
    parser.add_argument("--keyword", help="搜索关键词")
    parser.add_argument("--metrics", help="数据指标 (JSON格式)")
    
    args = parser.parse_args()
    
    print("="*60)
    print("📝 内容资产复利化管理")
    print("="*60)
    
    if args.action == "record_topic":
        if not args.content:
            print("❌ --content 参数必填")
            return
        
        result = record_topic(args.content, args.source)
        print(f"\n{result}")
    
    elif args.action == "search":
        if not args.keyword:
            print("❌ --keyword 参数必填")
            return
        
        results = search_content(args.keyword)
        print(f"\n🔍 找到 {len(results)} 条相关内容:")
        for r in results[:5]:
            print(f"\n📄 {r['file']}")
            print(f"   类型: {r['type']}")
            print(f"   预览: {r['preview'][:100]}...")
    
    elif args.action == "record_data":
        if not args.metrics:
            print("❌ --metrics 参数必填 (JSON格式)")
            return
        
        import json
        metrics = json.loads(args.metrics)
        result = record_data(args.content or "通用", metrics)
        print(f"\n{result}")


if __name__ == "__main__":
    main()
