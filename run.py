#!/usr/bin/env python3
"""Điểm chạy duy nhất cho mọi tool của repo — không cần cài đặt gì.

    python3 run.py serve [port]   # server tĩnh 选修课/web程序设计 (mặc định 8000)
    python3 run.py check          # kiểm tra link/charset/JS các project web
    python3 run.py test           # regression test mô phỏng hòa máy phát (GSP)
    python3 run.py paths          # liệt kê project + đường dẫn

Logic thật nằm trong python/kyxwebdev/ (Python stdlib thuần). File này chỉ
them thư mục python/ vào sys.path để chạy được ngay sau `git clone`,
không cần `pip install -e .`.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "python"))

from kyxwebdev.cli import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
