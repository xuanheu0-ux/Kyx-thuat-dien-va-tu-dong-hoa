# AGENTS.md — Hướng dẫn chạy & sửa repo này trong Antigravity

> Repo này **không phải một ứng dụng duy nhất**: đó là kho tài liệu môn học
> (Ngành Electrical Engineering & Automation, Đại học Giao thông Tây An – XJTU),
> gồm PDF/PPT/DOCX + mã nguồn MATLAB/Simulink/Verilog/C + một số project web.
> Không có lệnh `build` toàn cục. Hãy làm theo từng mục dưới đây.

## 1. Web projects — chạy được ngay (không cần cài gì ngoài Node.js)

```bash
npm run serve        # = node tools/serve.js  → http://localhost:8000  (HUB trang chủ)
npm run check        # = node tools/check_web.js → tự kiểm tra lỗi web project
```

Gốc phục vụ là `选修课/web程序设计`; trang `index.html` ở gốc đó là **hub** với menu
4 project: 坦克大战 (`大作业/Tank-master/`), 植物大战僵尸 (`大作业/植物大战僵尸/`),
反应力小游戏 (`大作业/小游戏/`), 贪吃蛇 (`大作业/贪吃蛇.html`), cùng danh mục bài tập
`实验/实验程序/`. Phím: Tank = WASD + Space; Snake = phím mũi tên; còn lại dùng chuột.

Game dùng DOM/CSS kiểu cũ (IE-era) — Chrome/Edge hiện tại vẫn chạy; **đừng "nâng cấp"**
chúng sang framework mới, đừng format lại các file này.

## 2. MATLAB 信号与系统 — chạy bằng Octave (không cần MATLAB)

```bash
sudo apt-get install -y octave octave-control octave-signal   # Debian/Ubuntu/WSL
tools/octave_run.sh 信号与系统/实验/exercise4.m              # GUI
tools/octave_run.sh 信号与系统/实验/exercise10.m --save      # headless → figs/*.png
```

Chi tiết, bảng tương thích từng bài và caveat `syms`: xem `信号与系统/实验/README.md`.
Các `.m` của môn khác (电机学/电力电子技术…) cùng dùng được cách này nếu chỉ là
script thuần; file `createFit*.m` cần Curve Fitting → nên mở bằng MATLAB thật.

## 3. Những thứ KHÔNG chạy được bằng lệnh trong IDE

Cần phần mềm thương mại ngoài IDE — máy chưa cài thì đừng cố build:

- `*.slx`, `*.mdl` → **Simulink** (nhiều model bản rất cũ, cần "Upgrade Model";
  simulink không có trong Octave).
- `数字电子技术与微处理器/**` (`.xpr/.xdc/.v`) → **Xilinx Vivado/ISE** (ISE 14.x chỉ Windows).
- `微处理器/实验` (STM32Cube) → **Keil MDK / STM32CubeIDE** (`.c` lẻ môn 程序设计基础 thì `gcc` thường là đủ).
- `工程电磁场/实验/*.aedt` → **ANSYS Electronics Desktop**; `*.ms14` → Multisim.
- `*.pdf *.ppt *.docx *.xls* *.jpg…` → tài liệu, **không phải mã nguồn**; tuyệt đối không sửa/định dạng lại.

## 4. Quy tắc sửa lỗi trong repo này

1. Toàn bộ file **văn bản** đã chuẩn hoá **UTF-8** (kể cả chú thích tiếng Trung trong
   `.m/.c/.v/.h`). Đừng convert ngược; không đụng vào các binary còn GBK
   (log Vivado `.pb/.str`, `*.aedtresults`, `.mdl`…) — chúng không cần mở.
2. Đường dẫn asset **phân biệt hoa/thường**: Windows thì chạy, nhưng server
   (Linux/macOS/Antigravity preview) 404. Đã sửa (`Surface.png`, `Level/`, `*.JPG`…).
   Khi thêm/tải asset, giữ đúng tên hoa/thường như trong code.
3. Không commit: `Thumbs.db`, `~$*` (khoá Office), `*.tmp`, `_vti_cnf/`, `*.exe`,
   `*.zip`, `figs/`… (xem `.gitignore`).
4. Sau khi sửa web: `npm run check` — exit code khác 0 là còn lỗi
   (⚠ warn = ảnh thiếu từ upstream, chấp nhận được, xem README của 植物大战僵尸).
5. File thiếu có chủ đích: `植物大战僵尸` thiếu 31 ảnh (5 cây + PuffShroom/FlowerPot/
   LilyPad/FootballZombie + nền) — bản gốc trên GitHub chưa tải lên; game vẫn chạy
   (loader có `onerror`). `信号与系统/实验/exercise1.m` là file rỗng trong nguồn.

## 5. Trạng thái sửa lỗi gần nhất (2026-09)

- `Tank-master/index.html`: xoá `<script src="Grid.js">` (không tồn tại → 404).
- `小游戏`: tạo `自制-csssheet.css` (thiếu → trang trắng), tách CSS nhầm lẫn trong
  `style.js` → `style.css` (hết lỗi cú pháp JS), thêm `<meta charset>`.
- `植物大战僵尸`: sửa 22 lỗi大小写 + đổi nguồn `Process.js` về local + README.
- `程序设计基础`: `test29.c/test33.c` đổi tên `getline`→`get_line` (xung đột POSIX) +
  chặn EOF; 80/80 file `.c` pass `gcc -fsyntax-only`.
- 219 file GBK→UTF-8 (binary đã loại trừ); 33 file `.html` thêm charset;
  gỡ 65 file rác khỏi index; thêm hub `index.html`, `tools/serve.js`,
  `tools/check_web.js`, `tools/octave_run.sh`.
