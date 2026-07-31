#!/usr/bin/env python3
"""Easy-Job-Tutor 跨平台一键安装脚本。

一条命令自动完成：创建虚拟环境 -> 安装依赖（PDF 导出）-> 检测并安装到已装好的 AI 工具。

macOS / Linux:
    python3 install.py
Windows (PowerShell):
    py install.py

可选参数:
    --skip-pdf     跳过 Chromium（PDF 导出依赖）安装，核心功能不受影响
    --skip-tools   跳过自动安装到 AI 工具
    --tool NAME    强制安装到指定 AI 工具（codex / claude / opencode / hermes），可重复
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
IS_WINDOWS = sys.platform.startswith("win")
VENV_PYTHON = ROOT / ".venv" / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")

# (AI 工具名, 相对用户主目录的 skills 目标路径)
AI_TOOLS = [
    ("Codex CLI", ".codex/skills/easy-job-tutor"),
    ("Claude Code", ".claude/skills/easy-job-tutor"),
    ("OpenCode", ".config/opencode/skills/easy-job-tutor"),
    ("Hermes Agent", ".hermes/skills/software-development/easy-job-tutor"),
]
TOOL_KEYS = {"codex": 0, "claude": 1, "opencode": 2, "hermes": 3}

# 复制到 skills 目录时排除的目录/文件（体积大或无意义）
COPY_IGNORES = [
    ".venv",
    ".pw-browsers",
    ".git",
    "__pycache__",
    ".pytest_cache",
    "node_modules",
    "dist",
    "outputs",
    "export",
    "preview",
    "*.pyc",
]


def _print(text: str = "") -> None:
    print(text, flush=True)


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def setup_venv() -> None:
    """创建虚拟环境并安装依赖（已存在则跳过创建）。"""
    if VENV_PYTHON.exists():
        _print("✔ 虚拟环境已存在，跳过创建。")
    else:
        _print("⏳ 创建虚拟环境 .venv ...")
        run([sys.executable, "-m", "venv", str(ROOT / ".venv")])
    _print("⏳ 安装依赖（playwright / pypdf / pytest）...")
    run([str(VENV_PYTHON), "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")])


def install_pdf_deps() -> None:
    """安装 PDF 导出所需的 Chromium 浏览器。"""
    _print("⏳ 安装 Chromium（PDF 导出用，需下载约 100MB+，请耐心等待）...")
    run([str(VENV_PYTHON), "-m", "playwright", "install", "chromium"])


def resolve_targets(forced: list[str]) -> list[tuple[str, Path]]:
    """确定要安装到的目标 AI 工具目录列表。"""
    if forced:
        home = Path.home()
        return [(AI_TOOLS[TOOL_KEYS[key]][0], home / AI_TOOLS[TOOL_KEYS[key]][1]) for key in forced]

    home = Path.home()
    found = []
    for name, rel in AI_TOOLS:
        dest = home / rel
        # 工具的 skills 父目录存在即认为该工具已安装
        if dest.parent.exists():
            found.append((name, dest))
    return found


def install_to_tools(forced: list[str]) -> None:
    """把项目复制到 AI 工具的 skills 目录。"""
    targets = resolve_targets(forced)

    if not targets:
        _print("⚠ 没有检测到已安装的 AI 工具（Codex CLI / Claude Code / OpenCode / Hermes Agent）。")
        _print("  请先安装你的 AI 工具后重新运行本脚本；")
        _print("  或指定工具强制安装，例如：python3 install.py --tool claude")
        return

    ignore = shutil.ignore_patterns(*COPY_IGNORES)
    for name, dest in targets:
        dest.parent.mkdir(parents=True, exist_ok=True)
        _print(f"✔ 正在安装到 {name}: {dest}")
        shutil.copytree(ROOT, dest, dirs_exist_ok=True, ignore=ignore)

    _print("✔ 安装完成！你的 AI 助手现在可以使用 Easy-Job-Tutor 技能了。")
    _print("  提示：安装到 skills 目录的内容不包含 .venv，如需要在 AI 工具内使用 PDF 导出，")
    _print("  可先在该目录内再运行一次本脚本（python3 install.py --skip-tools 仅装依赖）。")


def main() -> int:
    parser = argparse.ArgumentParser(description="Easy-Job-Tutor 跨平台一键安装脚本")
    parser.add_argument("--skip-pdf", action="store_true", help="跳过 Chromium（PDF 导出）安装")
    parser.add_argument("--skip-tools", action="store_true", help="跳过自动安装到 AI 工具")
    parser.add_argument(
        "--tool",
        action="append",
        choices=list(TOOL_KEYS),
        help="强制安装到指定 AI 工具（codex / claude / opencode / hermes），可重复",
    )
    args = parser.parse_args()

    setup_venv()
    if args.skip_pdf:
        _print("⏭ 已跳过 Chromium（--skip-pdf），PDF 导出暂不可用，核心功能不受影响。")
    else:
        install_pdf_deps()

    if args.skip_tools:
        _print("⏭ 已跳过安装到 AI 工具（--skip-tools）。")
    else:
        install_to_tools(args.tool or [])

    _print("🎉 全部完成！")
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows 控制台避免中文乱码
    except Exception:
        pass
    raise SystemExit(main())
