# 信号与系统 · 实验 — Chạy code MATLAB bằng GNU Octave

Thư mục `实验/` chứa 17 bài `exercise*.m` + hàm phụ trợ `sconv.m` của môn
**信号与系统 (Signals and Systems)**. Code viết cho MATLAB; repo này kèm script
`tools/octave_run.sh` để **chạy thử miễn phí bằng Octave** mà không cần MATLAB.

## Cài đặt Octave

| HĐH | Lệnh |
|---|---|
| Debian/Ubuntu/WSL | `sudo apt-get install -y octave octave-control octave-signal` |
| macOS | `brew install octave` rồi `pkg install -forge control signal` (trong octave) |
| Windows | khuyên dùng **WSL** theo dòng trên; hoặc cài Octave 64-bit từ octave.org (bản Windows ít package hơn) |

Package `symbolic` (cần cho các bài `syms`) cài thêm bằng:
`pkg install -forge symbolic` + `pip install sympy` — **nhưng lưu ý bên dưới**.

## Chạy

```bash
# GUI (cần display / WSLg)
tools/octave_run.sh 信号与系统/实验/exercise4.m

# Headless: mọi figure được xuất PNG vào 信号与系统/实验/figs/
tools/octave_run.sh 信号与系统/实验/exercise10.m --save
```

Hoặc thủ công trong REPL: `cd('信号与系统/实验'); pkg load signal control; run('exercise11.m')`

## Mức tương thích từng bài (rà soát theo hàm được gọi — chạy Octave trên máy bạn để xác nhận)

| Bài | Dùng | Octave |
|---|---|---|
| exercise1.m | — (file **rỗng** trong repo) | ⚠ không có nội dung |
| exercise2, 4, 5, 10 | plot/stem/fft/conv/heaviside | ✅ chạy nguyên văn (bài 4 cần `sconv.m` cùng thư mục) |
| exercise3 | `tf`,`impulse`,`step` | ✅ cần `pkg load control` |
| exercise11 | `cconv` | ✅ cần `pkg load signal` |
| exercise12 | `filtic` | ✅ cần `pkg load signal` |
| exercise13 | `tf2zp`,`zplane`,`freqz` | ✅ cần `control` + `signal` |
| exercise6, 7, 8, 9, 14, 15, 16, 17 | `syms`, `fourier`, `laplace(…,t,s)`, `ztrans`… | ⚠ Symbolic toolbox của Octave (sympy) **không cùng API** — xem dưới |

### Các bài `syms`

Octave symbolic chỉ hỗ trợ `laplace(f)`/`.laplace()` (một đối số), không có
`fourier(f,t,w)` hai ba đối số, không có `kroneckerDelta`. Có 2 cách:

1. **Chạy bằng MATLAB/SymPy thật** nếu bạn có license (đúng mục đích nộp bài).
2. Viết lại nhanh trong Octave — ví dụ bài 8:
   ```matlab
   pkg load symbolic
   syms t s
   X1 = laplace(sin(t)^2)          % không truyền (t,s)
   X2 = laplace(t*heaviside(t-2))
   ```
   và bài 14: thay `kroneckerDelta(n,0)+kroneckerDelta(n,1)` bằng
   `double(n==0)+double(n==1)` trước khi `ztrans`.

README này chỉ ghi cách chạy, **không sửa các file bài tập** — giữ nguyên bản nộp.

## Kết xuất

Ảnh chạy `--save` nằm ở `信号与系统/实验/figs/*.png` (đã nằm ngoài git — đừng commit
thành quả chạy máy; chỉ nộp PDF báo cáo như quy định của repo gốc).
