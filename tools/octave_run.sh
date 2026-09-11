#!/usr/bin/env bash
# octave_run.sh — chạy 1 file .m của repo bằng GNU Octave (thay MATLAB).
# Usage:
#   tools/octave_run.sh 信号与系统/实验/exercise2.m            # GUI (cần display)
#   tools/octave_run.sh 信号与系统/实验/exercise2.m --save     # headless, xuất PNG vào <thư mục script>/figs/
#   tools/octave_run.sh path/to/x.m --save outdir
# Tự `pkg load` các package có cài sẵn: control, signal, symbolic, communications...
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <script.m> [--save [outdir]]" >&2; exit 2
fi
SCRIPT="$1"; shift || true
SAVE=""
if [ "${1:-}" = "--save" ]; then
  SAVE="${2:-}"
fi

command -v octave >/dev/null 2>&1 || {
  echo "Octave chưa được cài. Xem 信号与系统/实验/README.md (mục Cài đặt)." >&2; exit 3;
}

SCRIPT_DIR=$(cd "$(dirname "$SCRIPT")" && pwd)
SCRIPT_NAME=$(basename "$SCRIPT")

# preludes are passed via --eval; note single-quotes inside are escaped
PRELUDE="
  cd('$SCRIPT_DIR');
  avail = pkg('list');
  for p = {'control','signal','symbolic','communications','geometry','io','image','linear-algebra','optim','specfun','statistics','struct'}
    if ismember(p{1}, fieldnames(avail))
      try pkg('load', p{1}); endtry
    end
  end
"

if [ -n "$SAVE" ]; then
  [ -d "$SAVE" ] || SAVE="$SCRIPT_DIR/figs"
  mkdir -p "$SAVE"
  octave --no-gui --norc --no-window-system --eval "
    $PRELUDE
    set(0,'defaultfigurevisible','off');
    st = run('$SCRIPT_NAME');
    figs = get(0,'children');
    for i = 1:numel(figs)
      n = get(figs(i),'number');
      print(figs(i), '-dpng', '$SAVE/fig' num2str(n) '.png');
    end
    fprintf('saved %d figure(s) to $SAVE\n', numel(figs));
  "
else
  octave --no-gui --norc --eval "$PRELUDE run('$SCRIPT_NAME');"
fi
