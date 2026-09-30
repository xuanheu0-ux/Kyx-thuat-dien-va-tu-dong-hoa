"""kyx — chạy/check/test các project web của repo, chỉ dùng Python stdlib.

Lệnh:
  serve [PORT]   phục vụ 选修课/web程序设计 (mặc định 8000, bind 0.0.0.0)
  check          chạy tools/check_web.js (cần Node — nếu máy không có Node thì bỏ qua)
  test           chạy tools/test_gsp_sim.js  (regression 22 assertion của mo-phong-gsp)
  paths          in đường dẫn các project chạy được
"""
from __future__ import annotations

import argparse
import functools
import http.server
import shutil
import socketserver
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "选修课" / "web程序设计"


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):  # luôn lấy bản mới nhất khi dev
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):  # 1 dòng gọn
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def cmd_serve(port: int) -> int:
    if not WEB.is_dir():
        print("Không tìm thấy thư mục web:", WEB, file=sys.stderr)
        return 1

    handler = functools.partial(_QuietHandler, directory=str(WEB))
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("0.0.0.0", port), handler) as srv:
            base = f"http://localhost:{port}"
            print(f"Serving {WEB}")
            print(f"  hub        → {base}/")
            print(f"  mô phỏng GSP → {base}/mo-phong-gsp/")
            print("(Ctrl+C để dừng)")
            srv.serve_forever()
    except OSError as e:
        print(f"Không mở được cổng {port}: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nDừng server.")
    return 0


def _run_node_tool(name: str) -> int:
    node = shutil.which("node")
    script = ROOT / "tools" / name
    if not node:
        print(
            f"⚠ '{name}' cần Node.js (chưa thấy trong PATH).\n"
            "  Cài Node ≥14 (https://nodejs.org) rồi chạy lại,\n"
            "  hoặc bỏ qua — web project không cần bước này để CHẠY (chỉ cần để KIỂM TRA).",
            file=sys.stderr,
        )
        return 127
    return subprocess.call([node, str(script)], cwd=ROOT)


def cmd_check() -> int:
    return _run_node_tool("check_web.js")


def cmd_test() -> int:
    return _run_node_tool("test_gsp_sim.js")


def cmd_paths() -> int:
    projects = {
        "hub": WEB / "index.html",
        "Mô phỏng PLC hòa máy phát (GSP)": WEB / "mo-phong-gsp" / "index.html",
        "Tank-master": WEB / "大作业" / "Tank-master" / "index.html",
        "植物大战僵尸 (PvZ)": WEB / "大作业" / "植物大战僵尸" / "index.html",
        "小游戏 (phản xạ)": WEB / "大作业" / "小游戏" / "自制小游戏.html",
        "贪吃蛇": WEB / "大作业" / "贪吃蛇.html",
        "Octave runner": ROOT / "tools" / "octave_run.sh",
    }
    for label, p in projects.items():
        mark = "✓" if p.exists() else "✗ THIẾU"
        rel = p.relative_to(ROOT) if p.exists() else str(p)
        print(f"  {mark} {label}: {rel}")
    print(f"  Python ≥3.9 đủ cho `serve`; Node ≥14 cho `check`/`test` (tuỳ chọn).")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="kyx", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("serve", help="server tĩnh cho các project web")
    s.add_argument("port", nargs="?", type=int, default=8000)

    sub.add_parser("check", help="kiểm tra liên kết/charset (tools/check_web.js)")
    sub.add_parser("test", help="regression test mô phỏng (tools/test_gsp_sim.js)")
    sub.add_parser("paths", help="liệt kê project chạy được")

    a = ap.parse_args(argv)
    if a.cmd == "serve":
        return cmd_serve(a.port)
    if a.cmd == "check":
        return cmd_check()
    if a.cmd == "test":
        return cmd_test()
    return cmd_paths()


if __name__ == "__main__":
    raise SystemExit(main())
