# mo-phong-gsp — Mô phỏng tủ hòa máy phát (P&A SJC-E-GSP-2021)

Mô phỏng **tương tác, chạy realtime** của "Sơ đồ khởi động — Generator
Synchronization/Control Panel" (bản vẽ P&A Automation, mã SJC-E-GSP-2021,
REV H 12/12/2021): máy phát diesel tự kích → dựng áp → hòa đồng bộ với
lưới → mang tải → tách, kèm các lỗi kinh điển.

> ⚠️ Công cụ **học tập**. Mô hình đơn giản hóa, KHÔNG dùng cho thiết kế thật.

## Chạy

Không cần cài gì, không cần mạng — file đứng một mình:

```bash
# cách 1: mở trực tiếp
mở index.html bằng Chrome/Edge (nháy đúp cũng được)

# cách 2: qua hub của repo (từ thư mục gốc repo)
python3 run.py serve 8000     # → http://localhost:8000/mo-phong-gsp/
# hoặc: npm run serve          (Node ≥14)
```

## Bấm gì theo thứ tự nào (đúng quy trình của bản vẽ)

| Bước | Thao tác | Ở đâu |
|---|---|---|
| ① | `FCR ĐÓNG` (đóng mạch kích từ) | bảng LOCAL |
| ② | `FIELD FLASHING` (xung từ dư → tự kích dựng áp ~2-3 s) | bảng LOCAL |
| ③ | giữ `TĂNG TỐC` tới f≈50.0 Hz, rồi hạ nhẹ về đúng điểm (đèn đồng bộ trôi đều) | LOCAL (hoặc HMI khi REMOTE) |
| ④ | `REMOTE` → `NETWORK MODE` → `ĐÓNG GCB` — rơ-le đồng bộ tự chờ Δφ≈0 | HMI |
| ⑤ | `TĂNG TỐC` mang tải (độ dốc tĩnh 4%: +2% ga ≈ +4% P) | bất kỳ |
| ⑥ | tách: giảm P về ≈0 → `CẮT GCB` → `DE-EXCITATE` | HMI → LOCAL |

Nút bấm sai thứ tự **bị chặn kèm lý do** trong log (DE-EXCITATE khi GCB
đang đóng, HMI bị khóa khi LOCAL, đóng GCB khi ΔU/Δf/Δφ vượt ngưỡng…).

## Các mục để "học bằng lỗi" (bảng Faults, bên phải)

- **Mất từ dư** — không flash thì 14 s sau `BUILD UP FAILURE`, PLC tự trip FCR.
- **Mất nguồn kích từ** khi đang mang tải — QRP phát hiện mất kích (P đảo,
  Iƒ≈0) → cắt GCB + de-excite.
- **Kẹt AVR** — vọt điện áp, nguy hiểm khi hòa.
- **Vô hiệu hóa rơ-le đồng bộ** — đóng ẩu lệch pha: xung dòng 3-4 pu,
  quá dòng cắt GCB ngay (chính là lý do bản vẽ bắt hòa qua rơ-le).

## Mô hình có gì

- 1 file `index.html` (~36 KB), UTF-8, **zero-dependency**, không fetch/xhr.
- SVG mimic động (lưới, QCB/FCR đỏ=đóng, =GEN_VT/=BUS_VT → FX3U-4AD, trip
  mạch cứng từ QRP không qua PLC, PLC FX3U-16MT, HMI MT6071P, step-motor
  governor, đèn quay đồng bộ) + bảng LED I/O đúng tên tín hiệu trong vẽ.
- Vật lý pu: tự kích + bão hòa mạch từ, AVR, điều tốc dốc tĩnh 4%, rotor
  một khối lượng quay, lưới vô cùng lớn, phóng từ khi hở FCR, 3 bảo vệ
  (OC/RP/LOSS-EXC), debounce "CLOSED (10s)" rút về 1 s cho demo, tốc độ mô
  phỏng ×1/×2/×4, chart canvas 7 series, log sự kiện.
- Ngắt/bấm đều đi qua **interlock mô phỏng PLC**, không phải chỉ animation.

## Test

```bash
python3 run.py test            # hoặc: node tools/test_gsp_sim.js
```
Driver DOM-giả-lập trong Node chạy **22 assertion**: dựng áp, watchdog
BUILD UP (fail khi mất từ dư), sync-relay chờ điểm trùng pha, mang tải,
mất kích từ → trip, hòa ẩu → xung kích → quá dòng cắt, interlock
LOCAL/REMOTE, debounce FCR… (kỳ vọng: `ALL GROUPS PASS`).

## Nguồn mô phỏng theo

Khối/tên lấy từ sheet 2/3 "Sơ đồ khởi động": PLC FX3U-16MT/ES, HMI Weintek
MT6071P (RS422), STEP MOTOR DRIVER (RS422), GEN PROTECTION =QRP, GCB =QCB,
=GEN_VT/=BUS_VT → module tương tự FX3U-4AD (Ug‑U,V; Ub‑U,V); tín hiệu
FIELD FLASHING / BUILD UP (FAILURE) / DE-EXCITATION / INCREASE / DECREASE /
RUNNING‑STOPPING / TRIP FCB / GCB‑FCR CLOSED (10s) / LOCAL‑REMOTE /
ALARM RESET / NETWORK MODE.
