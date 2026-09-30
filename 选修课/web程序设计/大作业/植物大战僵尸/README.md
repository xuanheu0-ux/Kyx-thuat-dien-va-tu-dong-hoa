# 植物大战僵尸 JavaScript 版 — 修复说明

## 运行方式（Antigravity / 任意浏览器）

```bash
npm run serve
# 打开 http://localhost:8000/大作业/植物大战僵尸/  (或从首页 hub 点卡片进入)
```

也可以直接双击 `index.html`（Windows 下可行；用服务器运行更稳）。

## 本次已修复

1. `index.html`：`images/surface.png` → `images/Surface.png`（Linux/macOS/服务器大小写敏感导致主界面背景 404）。
2. `js/Cfunction.js`：关卡脚本目录 `level/` → `Level/`（同上，之前非 Windows 环境无法进关）。
3. `js/Cfunction.js`：进度列表原来从 `http://demo.mycodes.net/...` 加载（站点已失效，且 http 资源在本地/https 环境会被拦截），改为加载本地 `js/Process.js`。
4. 全部 `Level/*.js` 及 `Cfunction.js` 的大小写不一致路径批量修正
   （`background1.jpg→.JPG`、`images/card/plants/→images/Card/Plants/` 等 21 处）。

## 已知缺失素材（非代码 bug）

以下 **31 个图片**在上游仓库中即缺失，游戏仍可正常载入与游玩
（加载器带 `onerror` 兜底），仅对应植物/僵尸无图像：

- `images/Plants/CoffeeBean/` — CoffeeBean.gif, CoffeeBeanEat.gif
- `images/Plants/FumeShroom/` — FumeShroom.gif, …Attack.gif, …Bullet.gif, …Sleep.gif
- `images/Plants/GloomShroom/` — GloomShroom.gif, …Attack.gif, …Bullet.gif, …Sleep.gif
- `images/Plants/PumpkinHead/` — PumpkinHead.gif, …1.gif, …2.gif, Pumpkin_back.gif, pumpkin_damage1/2.gif
- `images/Plants/TallNut/` — TallNut.gif, TallnutCracked1/2.gif
- `images/Plants/FlowerPot/FlowerPot.gif`、`images/Plants/LilyPad/LilyPad.gif`
- `images/Plants/PuffShroom/` — PuffShroom.gif, PuffShroomSleep.gif（第3关夜间用）
- `images/Zombies/FootballZombie/` — FootballZombie.gif, …Attack.gif, …OrnLost.gif, …OrnLostAttack.gif
- `images/interface/` — background2.jpg, sod3row.png, SelectorScreen_Almanac.png,
  SelectorScreen_AlmanacHighlight.png
  （注：`_vti_cnf/` 里的同名文件是 FrontPage 元数据占位文本，**不是**图片，勿改名拿来顶替。）

如需完整体验，可从 LonelyStar 原版 JSPVZ 包补齐同名文件。
（`npm run check` 会把这 30 个文件列为 ⚠ 警告而非 ✘ 错误。）
