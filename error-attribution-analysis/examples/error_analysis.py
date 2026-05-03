"""
示例：系统错误归因分析

用法：
    python error_analysis.py --log-file /path/to/error.log
    
功能：
    1. 解析错误日志
    2. 确定错误类型（用户/AI/系统/外部）
    3. 生成归因报告
"""

import argparse
import re
from pathlib import Path
from typing import Dict, List, Optional


# 错误模式定义
ERROR_PATTERNS = {
    "user_error": {
        "patterns": [
            r"invalid.*input",
            r"missing.*required.*parameter",
            r"permission.*denied",
            r"user.*canceled",
        ],
        "category": "用户操作错误",
        "responsibility": "用户"
    },
    "ai_error": {
        "patterns": [
            r"llm.*error",
            r"model.*timeout",
            r"ai.*response.*invalid",
            r"generation.*failed",
        ],
        "category": "AI 模型错误",
        "responsibility": "AI"
    },
    "system_error": {
        "patterns": [
            r"disk.*full",
            r"memory.*error",
            r"process.*crash",
            r"gateway.*timeout",
            r"connection.*reset",
        ],
        "category": "系统资源错误",
        "responsibility": "系统"
    },
    "external_error": {
        "patterns": [
            r"network.*unreachable",
            r"api.*rate.*limit",
            r"external.*service.*unavailable",
            r"timeout.*downstream",
        ],
        "category": "外部服务错误",
        "responsibility": "外部"
    }
}


def parse_log_file(log_path: str) -> List[Dict]:
    """解析日志文件，提取错误信息"""
    errors = []
    
    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        for line_num, line in enumerate(f, 1):
            if any(keyword in line.lower() for keyword in ["error", "exception", "failed", "critical"]):
                errors.append({
                    "line_num": line_num,
                    "content": line.strip(),
                    "timestamp": extract_timestamp(line)
                })
    
    return errors


def extract_timestamp(line: str) -> Optional[str]:
    """提取时间戳"""
    patterns = [
        r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}",
        r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, line)
        if match:
            return match.group()
    
    return None


def classify_error(error_line: str) -> Dict:
    """对错误进行分类"""
    error_lower = error_line.lower()
    
    for error_type, info in ERROR_PATTERNS.items():
        for pattern in info["patterns"]:
            if re.search(pattern, error_lower):
                return {
                    "type": error_type,
                    "category": info["category"],
                    "responsibility": info["responsibility"],
                    "confidence": "high"
                }
    
    return {
        "type": "unknown",
        "category": "未知错误",
        "responsibility": "待定",
        "confidence": "low"
    }


def analyze_errors(errors: List[Dict]) -> Dict:
    """分析错误分布"""
    analysis = {
        "total_errors": len(errors),
        "by_type": {},
        "by_responsibility": {
            "用户": 0,
            "AI": 0,
            "系统": 0,
            "外部": 0,
            "待定": 0
        },
        "recommendations": []
    }
    
    for error in errors:
        error_type = classify_error(error["content"])
        error["classification"] = error_type
        
        # 统计
        analysis["by_type"][error_type["category"]] = \
            analysis["by_type"].get(error_type["category"], 0) + 1
        
        analysis["by_responsibility"][error_type["responsibility"]] += 1
    
    # 生成建议
    if analysis["by_responsibility"]["系统"] > analysis["total_errors"] * 0.3:
        analysis["recommendations"].append(
            "系统资源错误占比过高，建议检查服务器状态和资源使用情况"
        )
    
    if analysis["by_responsibility"]["AI"] > analysis["total_errors"] * 0.3:
        analysis["recommendations"].append(
            "AI 错误占比过高，建议检查模型配置和 API 状态"
        )
    
    return analysis


def generate_report(errors: List[Dict], analysis: Dict, output_path: str):
    """生成错误归因报告"""
    
    report = f"""# 错误归因分析报告

## 概览

- **总错误数**: {analysis['total_errors']}
- **分析时间**: 报告生成时间

## 错误分布

### 按类型

| 错误类型 | 数量 | 占比 |
|----------|------|------|
"""
    
    for category, count in analysis["by_type"].items():
        pct = count / analysis["total_errors"] * 100
        report += f"| {category} | {count} | {pct:.1f}% |\n"
    
    report += """
### 按责任归属

| 责任方 | 数量 | 占比 |
|--------|------|------|
"""
    
    for resp, count in analysis["by_responsibility"].items():
        if count > 0:
            pct = count / analysis["total_errors"] * 100
            report += f"| {resp} | {count} | {pct:.1f}% |\n"
    
    report += """
## 详细错误列表

| 时间 | 行号 | 类型 | 描述 |
|------|------|------|------|
"""
    
    for error in errors[:20]:  # 最多显示20条
        cls = error.get("classification", {})
        report += f"| {error.get('timestamp', 'N/A')} | {error['line_num']} | {cls.get('category', '未知')} | {error['content'][:60]}... |\n"
    
    if len(errors) > 20:
        report += f"\n*...还有 {len(errors) - 20} 条错误未显示*\n"
    
    if analysis["recommendations"]:
        report += """
## 改进建议

"""
        for i, rec in enumerate(analysis["recommendations"], 1):
            report += f"{i}. {rec}\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    return report


def main():
    parser = argparse.ArgumentParser(description="系统错误归因分析")
    parser.add_argument("--log-file", required=True, help="日志文件路径")
    parser.add_argument("--output", default="/tmp/error_analysis.md", help="输出报告路径")
    
    args = parser.parse_args()
    
    print("="*60)
    print("🔍 错误归因分析")
    print("="*60)
    
    # Step 1: 解析日志
    print("\n📌 Step 1: 解析日志文件...")
    errors = parse_log_file(args.log_file)
    print(f"   发现 {len(errors)} 条错误")
    
    # Step 2: 分析归因
    print("\n📌 Step 2: 分析错误归因...")
    analysis = analyze_errors(errors)
    
    print("\n📊 错误分布:")
    for resp, count in analysis["by_responsibility"].items():
        if count > 0:
            print(f"   • {resp}: {count}")
    
    # Step 3: 生成报告
    print("\n📌 Step 3: 生成报告...")
    report = generate_report(errors, analysis, args.output)
    
    print(f"\n✅ 完成！报告已保存: {args.output}")
    
    if analysis["recommendations"]:
        print("\n💡 改进建议:")
        for rec in analysis["recommendations"]:
            print(f"   • {rec}")


if __name__ == "__main__":
    main()
