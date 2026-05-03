"""
示例：任务交付评分

用法：
    python score_task.py --task-id task_123 --accuracy 8.5 --completeness 9.0 --timeliness 7.0 --communication 8.0
    
功能：
    1. 对任务交付进行多维度评分
    2. 计算加权总分
    3. 生成评审报告
"""

import argparse
from datetime import datetime
from typing import Dict, List


# 评分维度配置
SCORING_DIMENSIONS = {
    "accuracy": {
        "name": "准确性",
        "weight": 0.35,
        "description": "任务完成是否符合要求、结果是否正确"
    },
    "completeness": {
        "name": "完整性",
        "weight": 0.30,
        "description": "是否完成所有要求、有无遗漏"
    },
    "timeliness": {
        "name": "时效性",
        "weight": 0.20,
        "description": "是否在约定时间内完成"
    },
    "communication": {
        "name": "沟通质量",
        "weight": 0.15,
        "description": "是否及时反馈、沟通是否清晰"
    }
}

# 评分等级
GRADE_LEVELS = {
    (9.0, 10.0): {"grade": "A+", "label": "卓越", "color": "🟢"},
    (8.5, 9.0): {"grade": "A", "label": "优秀", "color": "🟢"},
    (8.0, 8.5): {"grade": "B+", "label": "良好", "color": "🔵"},
    (7.0, 8.0): {"grade": "B", "label": "合格", "color": "🟡"},
    (6.0, 7.0): {"grade": "C", "label": "需改进", "color": "🟠"},
    (0.0, 6.0): {"grade": "D", "label": "不合格", "color": "🔴"}
}


def get_grade(score: float) -> Dict:
    """根据分数获取等级"""
    for (low, high), info in GRADE_LEVELS.items():
        if low <= score < high:
            return info
        if score == 10.0:
            return GRADE_LEVELS[(9.0, 10.0)]
    return GRADE_LEVELS[(0.0, 6.0)]


def calculate_weighted_score(scores: Dict[str, float]) -> float:
    """计算加权总分"""
    total = 0.0
    for dim, score in scores.items():
        if dim in SCORING_DIMENSIONS:
            weight = SCORING_DIMENSIONS[dim]["weight"]
            total += score * weight
    
    return round(total, 2)


def analyze_strengths(scores: Dict[str, float]) -> List[str]:
    """识别高分维度"""
    strengths = []
    for dim, score in scores.items():
        if score >= 8.5:
            strengths.append(f"{SCORING_DIMENSIONS[dim]['name']}优秀 ({score:.1f}分)")
    return strengths


def analyze_weaknesses(scores: Dict[str, float]) -> List[str]:
    """识别低分维度"""
    weaknesses = []
    for dim, score in scores.items():
        if score < 7.0:
            weaknesses.append(f"{SCORING_DIMENSIONS[dim]['name']}需改进 ({score:.1f}分)")
    return weaknesses


def generate_report(task_id: str, scores: Dict[str, float], overall: float,
                   grade: Dict, strengths: List, weaknesses: List,
                   output_path: str) -> str:
    """生成评审报告"""
    
    report = f"""# 任务交付评分报告

## 基本信息

- **任务ID**: {task_id}
- **评分时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **综合得分**: {overall:.2f} / 10.0
- **等级**: {grade['color']} {grade['grade']} ({grade['label']})

---

## 维度评分

| 维度 | 权重 | 得分 | 评价 |
|------|------|------|------|
"""
    
    for dim, config in SCORING_DIMENSIONS.items():
        score = scores.get(dim, 0)
        bar = "█" * int(score) + "░" * (10 - int(score))
        dim_grade = get_grade(score)
        report += f"| {config['name']} | {config['weight']:.0%} | {bar} {score:.1f} | {dim_grade['color']} {dim_grade['label']} |\n"
    
    if strengths:
        report += "\n## ✅ 优势维度\n\n"
        for s in strengths:
            report += f"- {s}\n"
    
    if weaknesses:
        report += "\n## ⚠️ 需改进维度\n\n"
        for w in weaknesses:
            report += f"- {w}\n"
    
    # 改进建议
    report += "\n## 📋 改进建议\n\n"
    
    for dim, score in scores.items():
        if score < 7.0:
            suggestions = {
                "accuracy": "建议重新核对任务要求，确保理解正确后可寻求clarification",
                "completeness": "建议对照原始需求逐项检查，确保无遗漏",
                "timeliness": "建议下次提前规划，预留buffer时间",
                "communication": "建议增加阶段性反馈，及时同步进度"
            }
            if dim in suggestions:
                report += f"- **{SCORING_DIMENSIONS[dim]['name']}**: {suggestions[dim]}\n"
    
    if overall >= 8.0:
        report += "\n---\n\n**🎉 任务交付质量优秀，继续保持！**\n"
    elif overall >= 7.0:
        report += "\n---\n\n**📝 任务交付合格，建议针对短板维度进行改进。**\n"
    else:
        report += "\n---\n\n**⚠️ 任务交付未达标，需要重点改进。请分析原因并制定提升计划。**\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    return report


def main():
    parser = argparse.ArgumentParser(description="任务交付评分")
    parser.add_argument("--task-id", required=True, help="任务ID")
    parser.add_argument("--accuracy", type=float, required=True, help="准确性得分 (0-10)")
    parser.add_argument("--completeness", type=float, required=True, help="完整性得分 (0-10)")
    parser.add_argument("--timeliness", type=float, required=True, help="时效性得分 (0-10)")
    parser.add_argument("--communication", type=float, required=True, help="沟通质量得分 (0-10)")
    parser.add_argument("--output", default="/tmp/task_score_report.md", help="输出报告路径")
    
    args = parser.parse_args()
    
    print("="*60)
    print("📊 任务交付评分")
    print("="*60)
    
    # 收集分数
    scores = {
        "accuracy": args.accuracy,
        "completeness": args.completeness,
        "timeliness": args.timeliness,
        "communication": args.communication
    }
    
    print("\n📌 维度得分:")
    for dim, score in scores.items():
        dim_name = SCORING_DIMENSIONS[dim]["name"]
        grade = get_grade(score)
        print(f"   {dim_name}: {score:.1f} {grade['color']} {grade['grade']}")
    
    # 计算总分
    overall = calculate_weighted_score(scores)
    grade = get_grade(overall)
    
    print(f"\n📊 综合得分: {overall:.2f} {grade['color']} {grade['grade']} ({grade['label']})")
    
    # 分析
    strengths = analyze_strengths(scores)
    weaknesses = analyze_weaknesses(scores)
    
    if strengths:
        print("\n✅ 优势:", ", ".join(strengths))
    
    if weaknesses:
        print("\n⚠️ 需改进:", ", ".join(weaknesses))
    
    # 生成报告
    print(f"\n📌 生成报告...")
    report = generate_report(
        args.task_id, scores, overall, grade,
        strengths, weaknesses, args.output
    )
    
    print(f"\n✅ 完成！报告已保存: {args.output}")
    
    # 最终判定
    if overall >= 7.0:
        print("\n🎉 任务交付达标")
    else:
        print("\n⚠️ 任务交付未达标，需要改进")


if __name__ == "__main__":
    main()
