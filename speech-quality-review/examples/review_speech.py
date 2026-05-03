"""
示例：话术质量评审

用法：
    python review_speech.py --input speech.md --min-score 7.0
    
功能：
    1. 分析话术内容
    2. 从多个维度评分
    3. 生成评审报告
"""

import argparse
import re
from typing import Dict, List


# 评分维度
SCORING_DIMENSIONS = {
    "开场": {
        "weight": 0.15,
        "keywords": ["欢迎", "宝宝们", "hello", "hi", "家人们", "各位"]
    },
    "钩子": {
        "weight": 0.20,
        "keywords": ["秒杀", "限量", "特价", "爆款", "必买", "错过", "赶紧"]
    },
    "产品介绍": {
        "weight": 0.25,
        "keywords": ["这款", "面料", "材质", "穿起来", "上身", "效果", "品质"]
    },
    "催单": {
        "weight": 0.20,
        "keywords": ["下单", "购买", "赶紧", "快来", "只剩", "结束", "恢复原价"]
    },
    "互动": {
        "weight": 0.10,
        "keywords": ["喜欢", "公屏", "评论", "扣", "想要", "告诉"]
    },
    "收尾": {
        "weight": 0.10,
        "keywords": ["感谢", "下次", "再见", "拜拜", "关注", "回放"]
    }
}


def analyze_dimensions(content: str) -> Dict[str, float]:
    """分析各维度得分"""
    content_lower = content.lower()
    scores = {}
    
    for dim, info in SCORING_DIMENSIONS.items():
        keywords_found = sum(1 for kw in info["keywords"] if kw in content_lower)
        # 归一化得分 (每个关键词最多贡献 0.2 分)
        score = min(1.0, keywords_found * 0.2)
        scores[dim] = round(score, 2)
    
    return scores


def calculate_overall_score(dimension_scores: Dict[str, float]) -> float:
    """计算综合得分"""
    total = 0.0
    for dim, score in dimension_scores.items():
        weight = SCORING_DIMENSIONS[dim]["weight"]
        total += score * weight
    
    return round(total * 10, 1)  # 转换为 10 分制


def identify_strengths(content: str, dimension_scores: Dict[str, float]) -> List[str]:
    """识别话术优点"""
    strengths = []
    
    for dim, score in dimension_scores.items():
        if score >= 0.8:
            strength_map = {
                "开场": "开场有吸引力，能快速抓住观众注意力",
                "钩子": "钩子设计出色，制造紧迫感和购买欲望",
                "产品介绍": "产品介绍详尽专业，突出卖点",
                "催单": "催单技巧娴熟，有效推动购买决策",
                "互动": "互动设计良好，增强观众参与感",
                "收尾": "收尾完整，为下次转化做铺垫"
            }
            strengths.append(strength_map.get(dim, dim))
    
    return strengths


def identify_weaknesses(content: str, dimension_scores: Dict[str, float]) -> List[str]:
    """识别话术改进点"""
    weaknesses = []
    
    for dim, score in dimension_scores.items():
        if score < 0.4:
            weakness_map = {
                "开场": "开场较弱，建议增加问候和自我介绍",
                "钩子": "缺少爆点钩子，建议增加限时/限量元素",
                "产品介绍": "产品介绍不足，建议增加面料/上身效果描述",
                "催单": "催单力度不够，建议增加紧迫感和优惠信息",
                "互动": "缺少互动设计，建议增加问答和引导评论",
                "收尾": "收尾过于简单，建议增加感谢和引导关注"
            }
            weaknesses.append(weakness_map.get(dim, dim))
    
    return weaknesses


def generate_report(content: str, dimension_scores: Dict, overall_score: float,
                   strengths: List, weaknesses: List, output_path: str):
    """生成评审报告"""
    
    report = f"""# 话术质量评审报告

## 综合评分

**总分**: {overall_score}/10.0

{"✅ 达标" if overall_score >= 7.0 else "⚠️ 未达标"} (最低门槛: 7.0)

## 维度评分

| 维度 | 得分 | 权重 | 加权得分 |
|------|------|------|----------|
"""
    
    for dim, score in dimension_scores.items():
        weight = SCORING_DIMENSIONS[dim]["weight"]
        weighted = score * weight * 10
        bar = "█" * int(score * 10) + "░" * (10 - int(score * 10))
        report += f"| {dim} | {bar} {score:.1f} | {weight:.0%} | {weighted:.1f} |\n"
    
    if strengths:
        report += "\n## ✅ 优点\n\n"
        for s in strengths:
            report += f"- {s}\n"
    
    if weaknesses:
        report += "\n## ⚠️ 改进建议\n\n"
        for w in weaknesses:
            report += f"- {w}\n"
    
    report += f"""
## 📋 原始话术预览

```
{content[:500]}{'...' if len(content) > 500 else ''}
```

---

*报告生成时间: 评审完成自动生成*
"""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    return report


def main():
    parser = argparse.ArgumentParser(description="话术质量评审")
    parser.add_argument("--input", required=True, help="话术文件路径")
    parser.add_argument("--min-score", type=float, default=7.0, help="最低达标分数")
    parser.add_argument("--output", default="/tmp/speech_review.md", help="输出报告路径")
    
    args = parser.parse_args()
    
    print("="*60)
    print("🎯 话术质量评审")
    print("="*60)
    
    # 读取话术
    print(f"\n📌 Step 1: 读取话术文件: {args.input}")
    try:
        with open(args.input, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        # 使用示例话术
        content = """欢迎宝宝们来到我的直播间！今天给大家带来一款超级爆款，
        专柜品质今天只要99块，错过今天恢复原价199！
        这款T恤面料是100%纯棉，穿起来特别舒服，上身效果非常好。
        已经卖了5000多件了，好评如潮！
        喜欢的宝宝赶紧下单，只剩最后50件了！
        感谢大家的陪伴，关注我下次直播更精彩！"""
        print("   (使用示例话术)")
    
    print(f"   话术长度: {len(content)} 字符")
    
    # 分析维度
    print("\n📌 Step 2: 分析各维度...")
    dimension_scores = analyze_dimensions(content)
    for dim, score in dimension_scores.items():
        print(f"   {dim}: {score:.1f}")
    
    # 计算总分
    overall_score = calculate_overall_score(dimension_scores)
    print(f"\n📊 综合得分: {overall_score}/10.0")
    
    # 识别优缺点
    print("\n📌 Step 3: 识别优缺点...")
    strengths = identify_strengths(content, dimension_scores)
    weaknesses = identify_weaknesses(content, dimension_scores)
    
    if strengths:
        print("\n✅ 优点:")
        for s in strengths:
            print(f"   • {s}")
    
    if weaknesses:
        print("\n⚠️ 改进建议:")
        for w in weaknesses:
            print(f"   • {w}")
    
    # 生成报告
    print(f"\n📌 Step 4: 生成报告...")
    report = generate_report(content, dimension_scores, overall_score,
                           strengths, weaknesses, args.output)
    
    print(f"\n✅ 完成！报告已保存: {args.output}")
    
    # 最终判定
    if overall_score >= args.min_score:
        print("\n🎉 话术达标，可以投入使用！")
    else:
        print(f"\n📝 话术未达标(需≥{args.min_score}分)，请根据建议改进")


if __name__ == "__main__":
    main()
