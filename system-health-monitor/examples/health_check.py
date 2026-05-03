"""
示例：系统健康监控

用法：
    python health_check.py --component hermes --output /tmp/health_report.md
    
功能：
    1. 检查 Hermes/OpenClaw 进程状态
    2. 检查日志异常
    3. 检查资源使用
    4. 生成健康报告
"""

import argparse
import subprocess
import psutil
from pathlib import Path
from datetime import datetime


def check_process(name: str) -> dict:
    """检查进程状态"""
    result = {
        "name": name,
        "running": False,
        "pid": None,
        "cpu_percent": 0.0,
        "memory_mb": 0,
        "uptime": None
    }
    
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            if name.lower() in proc.info['name'].lower():
                result["running"] = True
                result["pid"] = proc.info['pid']
                result["cpu_percent"] = proc.cpu_percent(interval=0.1)
                result["memory_mb"] = proc.info['memory_info'].rss / 1024 / 1024
                result["uptime"] = datetime.now() - datetime.fromtimestamp(
                    proc.create_time()
                )
                break
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    return result


def check_port(port: int) -> bool:
    """检查端口是否在监听"""
    for conn in psutil.net_connections():
        if conn.laddr.port == port and conn.status == 'LISTEN':
            return True
    return False


def check_log_health(log_path: str, error_keywords: list = None) -> dict:
    """检查日志健康状态"""
    if error_keywords is None:
        error_keywords = ["error", "exception", "critical", "failed"]
    
    result = {
        "path": log_path,
        "exists": False,
        "size_mb": 0,
        "error_count": 0,
        "recent_errors": []
    }
    
    log_file = Path(log_path)
    if not log_file.exists():
        return result
    
    result["exists"] = True
    result["size_mb"] = log_file.stat().st_size / 1024 / 1024
    
    # 读取最后 1000 行
    try:
        lines = log_file.read_text(encoding="utf-8", errors="ignore").splitlines()[-1000:]
        
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in error_keywords):
                result["error_count"] += 1
                if len(result["recent_errors"]) < 5:
                    result["recent_errors"].append(line.strip()[:100])
    except:
        pass
    
    return result


def check_disk_space(path: str = "/") -> dict:
    """检查磁盘空间"""
    usage = psutil.disk_usage(path)
    return {
        "total_gb": usage.total / 1024 / 1024 / 1024,
        "used_gb": usage.used / 1024 / 1024 / 1024,
        "free_gb": usage.free / 1024 / 1024 / 1024,
        "percent": usage.percent
    }


def generate_report(checks: dict, output_path: str) -> str:
    """生成健康报告"""
    
    report = f"""# 系统健康监控报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 整体状态

{"✅ 健康" if checks['status'] == 'healthy' else "⚠️ 存在问题" if checks['status'] == 'warning' else "❌ 异常"}

---

## 进程状态

| 组件 | 状态 | PID | CPU% | 内存(MB) | 运行时间 |
|------|------|-----|------|----------|----------|
"""
    
    for comp, info in checks.get("processes", {}).items():
        status = "✅ 运行中" if info["running"] else "❌ 未运行"
        pid = info.get("pid", "-")
        cpu = f"{info.get('cpu_percent', 0):.1f}"
        mem = f"{info.get('memory_mb', 0):.0f}"
        uptime = str(info.get('uptime', '-'))[:8] if info.get('uptime') else '-'
        
        report += f"| {comp} | {status} | {pid} | {cpu} | {mem} | {uptime} |\n"
    
    report += """
## 端口检查

| 端口 | 服务 | 状态 |
|------|------|------|
"""
    
    for port, service in checks.get("ports", {}).items():
        status = "✅ 监听中" if service["listening"] else "❌ 未监听"
        report += f"| {port} | {service['name']} | {status} |\n"
    
    report += """
## 资源使用

"""
    
    disk = checks.get("disk", {})
    report += f"""- **磁盘**: {disk.get('used_gb', 0):.1f}GB / {disk.get('total_gb', 0):.1f}GB ({disk.get('percent', 0):.1f}%)

## 日志健康

"""
    
    for log_name, log_info in checks.get("logs", {}).items():
        status_icon = "✅" if log_info["error_count"] == 0 else "⚠️"
        report += f"""### {log_name}

- 文件: `{log_info['path']}`
- 大小: {log_info['size_mb']:.2f}MB
- 错误数: {log_info['error_count']} {status_icon}

"""
        
        if log_info.get("recent_errors"):
            report += "**最近错误:**\n"
            for err in log_info["recent_errors"][:3]:
                report += f"```\n{err}\n```\n"
    
    if checks.get("issues"):
        report += """
## 发现的问题

"""
        for issue in checks["issues"]:
            report += f"- {issue}\n"
    
    if checks.get("recommendations"):
        report += """
## 建议

"""
        for rec in checks["recommendations"]:
            report += f"- {rec}\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)
    
    return report


def main():
    parser = argparse.ArgumentParser(description="系统健康监控")
    parser.add_argument("--component", default="hermes", choices=["hermes", "openclaw", "all"])
    parser.add_argument("--output", default="/tmp/health_report.md")
    
    args = parser.parse_args()
    
    print("="*60)
    print("💚 系统健康监控")
    print("="*60)
    
    checks = {
        "processes": {},
        "ports": {},
        "logs": {},
        "issues": [],
        "recommendations": []
    }
    
    # 检查进程
    print("\n📌 Step 1: 检查进程状态...")
    processes_to_check = []
    if args.component in ["hermes", "all"]:
        processes_to_check.append("hermes")
    if args.component in ["openclaw", "all"]:
        processes_to_check.append("openclaw")
    
    for name in processes_to_check:
        proc_info = check_process(name)
        checks["processes"][name] = proc_info
        status = "✅" if proc_info["running"] else "❌"
        print(f"   {status} {name}: {'Running' if proc_info['running'] else 'Not running'}")
    
    # 检查端口
    print("\n📌 Step 2: 检查端口监听...")
    ports_to_check = {
        8000: "Hermes Gateway",
        8080: "Hermes API",
        3000: "OpenClaw"
    }
    
    for port, service in ports_to_check.items():
        listening = check_port(port)
        checks["ports"][port] = {"name": service, "listening": listening}
        status = "✅" if listening else "❌"
        print(f"   {status} {port} ({service}): {'Listening' if listening else 'Not listening'}")
    
    # 检查日志
    print("\n📌 Step 3: 检查日志健康...")
    log_files = {
        "Hermes": "/tmp/hermes-skills/jarvis.log",
        "Gateway": "/tmp/gateway-watchdog.log"
    }
    
    for log_name, log_path in log_files.items():
        log_info = check_log_health(log_path)
        checks["logs"][log_name] = log_info
        status = "✅" if log_info["error_count"] == 0 else "⚠️"
        print(f"   {status} {log_name}: {log_info['error_count']} errors")
    
    # 检查磁盘
    print("\n📌 Step 4: 检查磁盘空间...")
    disk = check_disk_space("/")
    checks["disk"] = disk
    print(f"   磁盘使用: {disk['used_gb']:.1f}GB / {disk['total_gb']:.1f}GB ({disk['percent']:.1f}%)")
    
    # 生成报告
    print("\n📌 Step 5: 生成报告...")
    
    # 判断状态
    if all(p["running"] for p in checks["processes"].values()):
        if all(l.get("error_count", 0) < 10 for l in checks["logs"].values()):
            checks["status"] = "healthy"
        else:
            checks["status"] = "warning"
    else:
        checks["status"] = "unhealthy"
        checks["issues"].append("部分进程未运行")
    
    # 建议
    if disk["percent"] > 80:
        checks["recommendations"].append(f"磁盘空间不足 ({disk['percent']:.1f}%)，建议清理")
    
    report = generate_report(checks, args.output)
    
    print(f"\n✅ 完成！报告已保存: {args.output}")
    
    # 状态总结
    status_icon = {"healthy": "✅", "warning": "⚠️", "unhealthy": "❌"}
    print(f"\n整体状态: {status_icon.get(checks['status'], '❌')} {checks['status']}")


if __name__ == "__main__":
    main()
