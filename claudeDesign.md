# Claude Design 調整紀錄

記錄每次由 Claude Design 提案、並實際套用至專案的視覺調整。

---

## 2026-06-01 — Viewport Inner Glow（四邊向內光暈）

**參考來源：** `webSample.png`（暖桃色光暈從四邊向內漸層效果）

**修改檔案：** `src/App.vue`

### 調整內容

#### 新增 CSS 變數（`:root`）

```css
--glow-color-1: rgba(210, 110, 50, 0.16);   /* 暖橙，貼近邊緣的緊密光暈 */
--glow-color-2: rgba(181, 58, 38, 0.08);    /* 品牌紅，向內擴散的柔和光暈 */
--glow-spread-1: 80px;
--glow-spread-2: 220px;
```

#### 新增 HTML 元素（`<template>`）

```html
<!-- .app-container 第一個子元素 -->
<div class="viewport-glow" aria-hidden="true"></div>
```

#### 新增 CSS 規則

```css
.viewport-glow {
  position: fixed;   /* 跳出 max-width: 1440px 容器，覆蓋完整 viewport */
  inset: 0;
  pointer-events: none;
  z-index: 900;      /* 低於 NavBar 手機選單（1000–1001），不干擾互動 */
  box-shadow:
    inset 0 0 var(--glow-spread-1) var(--glow-color-1),
    inset 0 0 var(--glow-spread-2) var(--glow-color-2);
}
```

#### 手機版縮小（`@media (max-width: 768px)`）

```css
:root {
  --glow-spread-1: 50px;
  --glow-spread-2: 130px;
}
```

### 技術說明

- `inset box-shadow` 從元素內壁向內投影，搭配 `position: fixed; inset: 0` 即可製造四邊光暈效果
- 雙層疊加：第一層暖橙（緊、明顯）定義邊緣存在感；第二層品牌紅（寬、透）提供景深感
- `pointer-events: none` 確保光暈層不攔截任何點擊事件
- 變數化設計：調整光暈強度只需修改 `:root` 內的 `--glow-color-*` alpha 值

### 微調建議

| 目標效果 | 調整項目 |
|----------|----------|
| 光暈更明顯 | 提高 `--glow-color-1` alpha（0.16 → 0.22） |
| 光暈更柔和 | 降低 alpha 或加大 spread |
| 向內延伸更深 | 增加 `--glow-spread-2`（220px → 320px） |
| 色調偏紅而非橙 | 將 `--glow-color-1` 改為 `rgba(181, 58, 38, 0.16)` |

---

## 2026-06-01 — Viewport Glow 漏光細線（Light Leak Line）

**效果描述：** 四邊緊貼視口邊緣新增明亮細線＋往內的橙色暈散，製造相機漏光感。

**修改檔案：** `src/App.vue`

### 調整內容

#### 新增 CSS 變數（`:root`，接續 Inner Glow 區塊）

```css
--glow-line-color: rgba(255, 200, 140, 0.55);  /* 細線本體：亮暖白橙 */
--glow-line-bloom: rgba(240, 150, 80, 0.30);   /* 細線向內暈散：橙色漏光 */
--glow-line-width: 2px;                         /* 細線粗細 */
--glow-line-bloom-spread: 22px;                 /* 漏光擴散範圍 */
```

#### 修改 `.viewport-glow` box-shadow（新增前兩層）

```css
box-shadow:
  inset 0 0 0 var(--glow-line-width) var(--glow-line-color),      /* 清晰細線，無模糊 */
  inset 0 0 var(--glow-line-bloom-spread) 0 var(--glow-line-bloom), /* 細線的橙色外暈 */
  inset 0 0 var(--glow-spread-1) var(--glow-color-1),              /* 原有：暖橙大範圍光暈 */
  inset 0 0 var(--glow-spread-2) var(--glow-color-2);              /* 原有：品牌紅景深光暈 */
```

### 技術說明

- **第一層（細線）**：spread 值設為 `var(--glow-line-width)`、blur 為 `0`，產生無羽化的清晰邊線
- **第二層（bloom）**：spread 為 `0`、blur 為 `var(--glow-line-bloom-spread)`，讓細線往內柔和擴散
- 四層 shadow 由內而外：細線 → bloom → 暖橙暈 → 紅色景深，視覺有層次感

### 微調建議

| 目標效果 | 調整項目 |
|----------|----------|
| 細線更銳利明顯 | 提高 `--glow-line-color` alpha（0.55 → 0.8） |
| 漏光擴散更寬 | 增加 `--glow-line-bloom-spread`（22px → 40px） |
| 細線更細 | 縮小 `--glow-line-width`（2px → 1px） |
| 整體偏涼色調 | 將 `--glow-line-color` 改為帶藍的白（`rgba(220, 220, 255, 0.5)`） |

---

## 2026-06-01 — ProfileCard Tag Pill 移至照片（CASE 03）

**效果描述：** Developer 職稱膠囊從右側文案欄移入左側照片左上角，加上玻璃磨砂質感。

**修改檔案：** `src/components/ProfileCard.vue`

### 調整內容

#### Template 異動

- 將 `<div class="tag-pill" ref="tagRef">` 從 `.profile-content` 移至 `.profile-image-wrapper` 末端
- 加上 `on-photo` class；`ref="tagRef"` 與 `{{ profile.title }}` 原封不動

#### CSS 異動

`.profile-image-wrapper` 加入 `position: relative`（讓子元素絕對定位基準正確）。

新增 `.tag-pill.on-photo`：

```css
.tag-pill.on-photo {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
```

### 技術說明

- `overflow: hidden` 在 `.profile-image-wrapper` 已存在；`position: absolute` 子元素定位在可見範圍內不會被裁切
- GSAP `tagRef` 動畫不需更動：原 `from(tagRef, {opacity:0, y:10})` 仍作用於同一 ref，動畫時序不變

### 微調建議

| 目標效果 | 調整項目 |
|----------|----------|
| 膠囊更透明 | 降低 `background` alpha（0.18 → 0.10） |
| 膠囊邊框更明顯 | 提高 `border` alpha（0.35 → 0.55） |
| 移至右上角 | `left` 改為 `right: var(--space-2)` |

---

## 2026-06-01 — Performance Card 玻璃光暈（CASE 04）

**效果描述：** Skills 與 Works 頁的效能分數卡片加入彩色光暈底層 + 玻璃罩，提升視覺層次。兩頁配色不同以適配各自背景。

**修改檔案：** `src/components/SkillsSection.vue`、`src/components/WorksSection.vue`

### 調整內容

#### Template 結構（兩檔相同模式）

在 `.performance-card` 內加入：
1. `<div class="perf-glow-bg"></div>` — 彩色光暈層（絕對定位，背景 radial-gradient + blur）
2. `<div class="perf-glass">` — 玻璃罩包裹所有原有內容（backdrop-filter）

原本的動態綁定（`targetSize`/`targetColor`/`activeProject.performance.*`/`:class="is-error"`）**完全未動**。

#### CSS — SkillsSection（深色底 `#212529`，藍／紅光暈）

```css
.perf-glow-bg {
  background:
    radial-gradient(ellipse at 30% 70%, rgba(56, 100, 200, 0.55) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 30%, rgba(181, 57, 38, 0.50) 0%, transparent 55%);
  filter: blur(24px);
}
```

#### CSS — WorksSection（紅色底 `--accent-color`，暖橘／深紅光暈）

```css
.perf-glow-bg {
  background:
    radial-gradient(ellipse at 25% 75%, rgba(255, 150, 50, 0.60) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 25%, rgba(100, 10, 5, 0.55) 0%, transparent 55%);
  filter: blur(24px);
}
```

同時 WorksSection `.performance-card` 補上 `position: relative; overflow: hidden;`（原本未設定）。

#### CSS 共用（`.perf-glass`，兩檔各自定義）

```css
.perf-glass {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.07~0.08);
  border: 1px solid rgba(255, 255, 255, 0.14~0.16);
  border-radius: 0.75rem;
  padding: var(--space-2);
}
```

### 技術說明

- **z-stack**：卡片背景（z:auto） → `.perf-glow-bg`（z:0，absolute） → `.perf-glass`（z:1，relative）
- `backdrop-filter` 模糊的是其下方所有已渲染像素，包含卡片背景色 + glow-bg 的漸層，讓玻璃感有東西可模糊
- `overflow: hidden` 確保 glow-bg 的 blur 不溢出卡片圓角外

### 微調建議

| 目標效果 | 調整項目 |
|----------|----------|
| 光暈更強烈 | 提高 `perf-glow-bg` radial-gradient alpha |
| 玻璃更透明 | 降低 `perf-glass` background alpha |
| 模糊感更強 | 增加 `backdrop-filter: blur` 數值（8px → 16px） |
| 光暈位置調整 | 修改 radial-gradient 的 `ellipse at X% Y%` 座標 |
