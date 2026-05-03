"""
示例：路由决策演示

用法：
    python route_demo.py --query "帮我剪辑一个带货视频"
    
功能：
    演示 hermes-router 如何根据用户意图路由到正确的 Skill
"""

import argparse
import re
from typing import Dict, List, Optional


# 简化的路由规则（实际应从 hermes-router/SKILL.md 加载）
ROUTING_RULES = {
    "ecommerce": {
        "patterns": [
            (r"竞品|对手|监控", "douyin-video-acquisition"),
            (r"话术|文案|脚本", "neirong-fuoli"),
            (r"钩子|爆款.*分析", "ecommerce-short-video-hook-research"),
        ],
        "skills": ["douyin-video-acquisition", "neirong-fuoli", "ecommerce-short-video-hook-research"]
    },
    "media": {
        "patterns": [
            (r"剪辑|精剪|切片段", "jianying-editor-skill"),
            (r"转写|字幕|Whisper", "whisper-video-clipping-workflow"),
            (r"直播切片|带货片段|挂车", "ecommerce-video-clip-workflow"),
            (r"抖音.*获取|下载.*抖音", "douyin-video-acquisition"),
            (r"高光|精彩瞬间", "ecommerce-video-highlights"),
            (r"YoYo|悠悠有鸽", "yoyo-video-clipping-workflow"),
        ],
        "skills": ["jianying-editor-skill", "whisper-video-clipping-workflow", 
                   "ecommerce-video-clip-workflow", "ecommerce-video-highlights"]
    },
    "audit": {
        "patterns": [
            (r"话术审核|评审|质量", "speech-quality-review"),
            (r"任务评分|交付.*审计", "task-delivery-scoring"),
            (r"系统.*监控|健康.*检查", "system-health-monitor"),
            (r"错误.*分析|归因", "error-attribution-analysis"),
        ],
        "skills": ["speech-quality-review", "task-delivery-scoring", 
                   "system-health-monitor", "error-attribution-analysis"]
    }
}


def normalize_query(query: str) -> str:
    """标准化查询"""
    return query.lower().strip()


def match_skill(query: str) -> List[Dict]:
    """
    匹配最合适的 Skill
    
    Args:
        query: 用户查询
    
    Returns:
        List[Dict]: 匹配的 Skill 列表（按优先级排序）
    """
    query = normalize_query(query)
    matches = []
    
    for category, info in ROUTING_RULES.items():
        for pattern, skill_name in info["patterns"]:
            if re.search(pattern, query):
                matches.append({
                    "skill": skill_name,
                    "category": category,
                    "matched_on": pattern,
                    "confidence": calculate_confidence(query, pattern)
                })
    
    # 按置信度排序
    matches.sort(key=lambda x: x["confidence"], reverse=True)
    
    # 去重
    seen = set()
    unique_matches = []
    for m in matches:
        if m["skill"] not in seen:
            seen.add(m["skill"])
            unique_matches.append(m)
    
    return unique_matches


def calculate_confidence(query: str, pattern: str) -> float:
    """计算匹配置信度"""
    base = 0.5
    
    # 精确匹配
    if re.search(pattern, query):
        base = 0.8
    
    # 包含更多关键词
    words = pattern.replace(r"\.*", "").split("|")
    match_count = sum(1 for w in words if w in query)
    
    return min(1.0, base + match_count * 0.1)


def explain_routing(query: str, matches: List[Dict]) -> str:
    """生成路由解释"""
    
    explanation = f"""
## 🔀 路由分析

**原始查询**: "{query}"
**标准化**: "{normalize_query(query)}"

### 匹配详情
"""
    
    for i, match in enumerate(matches, 1):
        explanation += f"""
**候选 {i}**: `{match['skill']}`
- 分类: {match['category']}
- 匹配模式: `{match['matched_on']}`
- 置信度: {match['confidence']:.0%}
"""
    
    if matches:
        best = matches[0]
        explanation += f"""
### ✅ 推荐 Skill

**{best['skill']}** (置信度 {best['confidence']:.0%})

"""
        if best['confidence'] >= 0.8:
            explanation += "该匹配具有高置信度，可以直接使用。"
        elif best['confidence'] >= 0.6:
            explanation += "匹配置信度中等，可能需要确认用户意图。"
        else:
            explanation += "匹配置信度较低，建议询问用户具体需求。"
    else:
        explanation += """
### ⚠️ 未匹配到合适 Skill

无法确定合适的 Skill，建议：
1. 询问用户更具体的需求
2. 提供可用的 Skill 列表供选择
3. 由 Agent 直接回答（fallback）
"""
    
    return explanation


def get_all_skills_table() -> str:
    """获取所有可用 Skill 的表格"""
    
    table = """
## 📋 可用 Skills 列表

### 🛒 电商运营
| Skill | 说明 | 触发词 |
|-------|------|--------|
| neirong-fuoli | 内容资产复利化 | 话术、文案、脚本 |
| douyin-video-acquisition | 抖音视频获取 | 竞品、监控 |
| ecommerce-short-video-hook-research | 短视频钩子研究 | 钩子、爆款 |

### 🎬 视频剪辑
| Skill | 说明 | 触发词 |
|-------|------|--------|
| jianying-editor-skill | 剪映草稿生成 | 剪辑、精剪 |
| whisper-video-clipping-workflow | Whisper 转写 | 转写、字幕 |
| ecommerce-video-clip-workflow | 竞品视频精剪 | 直播切片、带货 |
| ecommerce-video-highlights | 高光片段提取 | 高光、精彩 |

### ⚖️ 监查审计
| Skill | 说明 | 触发词 |
|-------|------|--------|
| speech-quality-review | 话术质量审议 | 话术审核、评审 |
| task-delivery-scoring | 任务交付审计 | 任务评分 |
| system-health-monitor | 系统健康监控 | 系统监控 |
| error-attribution-analysis | 错误归因分析 | 错误分析 |
"""
    return table


def main():
    parser = argparse.ArgumentParser(description="Hermes Router 路由演示")
    parser.add_argument("--query", required=True, help="用户查询/意图")
    parser.add_argument("--show-all", action="store_true", help="显示所有可用 Skill")
    
    args = parser.parse_args()
    
    print("="*60)
    print("🔀 Hermes Router 路由演示")
    print("="*60)
    
    # 匹配 Skill
    matches = match_skill(args.query)
    
    # 生成解释
    explanation = explain_routing(args.query, matches)
    print(explanation)
    
    # 可选：显示所有 Skill
    if args.show_all:
        print(get_all_skills_table())


if __name__ == "__main__":
    main()
