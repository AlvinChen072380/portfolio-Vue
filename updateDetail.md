# 專案更新紀錄 (Update Details)

此文件用於彙整並記錄本專案的各次更新與迭代過程，後續的新增功能或微調都會統一記錄於此。

---

## [2026-05-30] 🐛 Bug 修復：ProjectCardDetail 頁面跳轉時 Scrollbar 閃現

### 📁 異動檔案
- `src/components/ProjectCardDetail.vue` — `.project-detail-page` 補上元件層的 scrollbar 隱藏

### ❓ 為什麼需要修正？
`ProjectCardDetail` 頁面內容較長（overview、architecture 文字 + sidebar 資訊），超過視口高度需要捲動。全域 `style.css` 已對 `body` 隱藏原生 scrollbar，但在 Windows 環境下，頁面切換動畫進行時，瀏覽器可能在渲染完成前短暫顯示原生滾動條（尤其 Chrome on Windows 有此行為）。

### 🎯 修正方式
在元件根元素加上第二層 scrollbar 隱藏，形成雙層防護：

```css
/* style.css — 第一層（全域） */
body { scrollbar-width: none; }
body::-webkit-scrollbar { display: none; }

/* ProjectCardDetail.vue — 第二層（元件層） */
.project-detail-page {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.project-detail-page::-webkit-scrollbar {
  display: none;
}
```

### 📚 基礎知識：`position: fixed` vs `position: absolute` 的 scroll hint 選擇

此次評估是否將 scroll hint 改為 SkillsSection 的 `position: absolute` 樣式，結論是**維持 `position: fixed`**，原因如下：

| | `position: absolute`（SkillsSection） | `position: fixed`（ProjectCardDetail）|
|--|--------------------------------------|---------------------------------------|
| **捲動類型** | 容器內部捲動（有邊界的 overflow 區塊） | 全頁捲動（body scroll） |
| **視覺錨點** | 錨在容器底部，隨容器滾動消失 | 釘在視窗底部，不隨頁面內容滾動 |
| **引導效果** | 只在容器頂部可見，捲動後消失 | 全程可見，直到使用者開始捲動才淡出 |
| **本例適用** | ✅ 技能列表（有固定高度容器） | ✅ 長內容詳細頁（全頁捲動） |

**設計原則**：當捲動發生在**容器內部**（有 `overflow: auto` 的元素），使用 `position: absolute`；當捲動發生在**整個頁面**（body scroll），使用 `position: fixed`。兩者在自己的場景下都是正確選擇，不應互換。

---

## [2026-05-30] 🔧 版面調整：WorksSection 高度壓迫感修復（多階段分析）

### 📁 異動檔案
- `src/components/WorksSection.vue` — `.project-image` 加入 `max-height: 460px`；`.works-layout` gap 從 32px 增至 40px；`min-height` 改為 `clamp(380px, 55dvh, 480px)`
- `src/components/SkillsSection.vue` — `min-height` 同步改為 `clamp(380px, 55dvh, 480px)`；`section-title margin-bottom` 縮減
- `src/App.vue` — `.main-content` 加入 `padding-bottom: var(--space-8)`

### ❓ 問題描述
Works 頁面內容貼近視口底部，產生視覺壓迫感。縮放至 90% 時比例最理想。

### 🔍 分析過程（三階段排查）

**第一階段：修改 `min-height` 無效**

最初判斷是 `min-height: 600px` 太大，改為 `clamp(380px, 55dvh, 480px)`，但畫面完全沒變化。

**根本原因**：`min-height` 是高度的「下限」，但實際高度是由**內容**決定的。`.project-image` 使用 `aspect-ratio: 16/9` 且 `width: 100%`，在 7fr 寬欄（約 740~860px）下，圖片計算高度：

```
圖片高度 = 欄寬 / 16 × 9
         = 860px / 16 × 9 ≈ 483px
加上 project-info（~150px）= 633px

633px >> min-height: 480px → min-height 完全失效
```

**第二階段：測試增大 gap 有效但過大**

測試將 `gap` 增至 `6rem = 96px` 時視覺接近預期。原理：gap 增大 → 7fr 欄位縮小 → 圖片變窄 → 16/9 高度縮小。但 6rem 欄間距過大影響視覺整體性。

**第三階段（根本解法）：`max-height` 直接限制圖片高度**

`max-height: 460px` 直接設定圖片高度上限，不依賴欄位寬度：
```
圖片：max 460px
project-info：~150px
合計：~610px → 配合 gap 40px 達到理想比例
```

### 🎯 最終修正組合

```css
/* 1. 圖片高度設定上限，不再受欄位寬度影響 */
.project-image {
  max-height: 460px;
}

/* 2. gap 微幅增大，補足欄間視覺呼吸感 */
.works-layout {
  gap: var(--space-5); /* 32px → 40px */
}

/* 3. App.vue — 全站底部統一留白 */
.main-content {
  padding-bottom: var(--space-8);
}
```

### 📚 基礎知識：CSS 高度的優先順序與常見陷阱

#### 1. 高度由「最大者」決定（不是 min-height）

```
實際高度 = max(min-height, 內容高度)
```

當內容高度 > min-height，**min-height 完全失效**，內容高度才是真正的控制者。這是本次排查最關鍵的發現。

```css
/* ❌ 這樣改沒用 — 若圖片高 500px，min-height: 480px 不會縮小版面 */
.works-layout { min-height: 480px; }

/* ✅ 正確做法 — 直接限制讓高度膨脹的元素 */
.project-image { max-height: 460px; }
```

#### 2. `aspect-ratio` 讓元素高度隨寬度變化

```css
.image {
  width: 100%;
  aspect-ratio: 16/9;
}
```

`width: 100%` 是相對父元素的，父元素越寬，圖片越高。在 Grid 的 `7fr` 寬欄中，父元素可達 700~900px，導致圖片高達 400~500px。

**規律**：`aspect-ratio` 元素的高度 = **父容器寬度 / 比例分子 × 比例分母**

#### 3. Grid `gap` 間接影響內容高度

```
可用內容寬度 = 容器寬度 - 所有 gap 寬度 - auto 欄寬度

gap 增大 → 可用寬度縮小 → 7fr 欄變窄 → aspect-ratio 圖片高度降低
```

這就是為什麼增大 gap 能改善版面，但這是**間接效果**，不如 `max-height` 直接且穩定。

#### 4. `max-height` 與 `aspect-ratio` 同時存在時的行為

```css
.image {
  width: 100%;           /* 寬度由父元素決定，例如 860px */
  aspect-ratio: 16/9;    /* 計算高度應為 484px */
  max-height: 460px;     /* 但 max-height 限制在 460px */
}
```

最終結果：寬度 860px、高度 460px（非 16/9 比例），`object-fit: cover` 負責在這個非標準比例的容器內完美裁切圖片，不變形。

---

## [2026-05-30] 🐛 Bug 修復：Works 頁面載入時版面彈跳（兩階段修復）

### 📁 異動檔案
- `src/components/WorksSection.vue` — 移除 `cardRef` 動畫的 `y: 15`（第一階段）
- `src/App.vue` — 頁面切換動畫移除 `y` 軸移動，改為純 opacity（第二階段，根本解決）

### ❓ 為什麼發生？

**第一階段（未完全解決）：卡片動畫 y 疊加**

WorksSection 的 `cardRef` 動畫有 `y: 15`，與頁面切換的 `y: 15` 相同方向疊加，卡片被重置後跳動。→ 移除卡片的 `y` 後仍有跳動。

**第二階段（根本原因）：頁面切換 `y` 移動 + 超長頁面**

```
App.vue onEnter: gsap.from(el, { y: 15 })
                           ↓
Works 頁面 .works-layout 有 min-height: 600px
→ 頁面內容高度 > viewport 高度
→ 整頁從 y:15 往上移動 15px 時，超出 viewport 的部分產生可見位移
→ 視覺上明顯感受到「跳動」
```

About 和 Skills 頁面高度較短，y 移動不明顯，所以只有 Works 頁面有此問題。

### 🎯 最終修正方式

```javascript
// 修改前 — y 移動造成超長頁面彈跳
const onEnter = (el, done) => {
  gsap.from(el, { opacity: 0, y: 15, duration: 0.35, ease: 'power2.out', onComplete: done })
}

// 修改後 — 純 opacity，各元件的 x 軸動畫提供方向感
const onEnter = (el, done) => {
  gsap.from(el, { opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: done })
}
```

### 📚 基礎知識：動畫設計的軸向原則

在多層動畫架構中，**不同層級的動畫應負責不同的軸向**，避免同一屬性重複操作：

| 動畫層級 | 負責效果 | 使用屬性 |
|---------|---------|---------|
| 頁面切換（App.vue） | 整體出現/消失 | `opacity` 只（避免 y 衝突）|
| 元件標題 | 方向性進場 | `opacity` + `x`（水平滑入）|
| 元件卡片 | 淡入 | `opacity` 只（無 y 衝突）|
| 技能卡片 stagger | 層次感 | `opacity` + 小幅 `y`（頁面切換結束後才啟動，不重疊）|

**關鍵原則**：當頁面高度 > viewport 時，任何 `y` 方向的位移都可能產生可見的版面位移。頁面級動畫應只用 `opacity`，讓 `y/x` 移動留給頁面內的元件使用。

---



### 📁 異動檔案
- `src/components/WorksSection.vue` — 移除 `cardRef` 動畫的 `y: 15`

### ❓ 為什麼發生？

頁面切換（App.vue）與 WorksSection 的卡片動畫同時對 y 軸進行操作：

```
App.vue @enter：gsap.from(pageEl, { y: 15 })       ← 整個頁面從 y:15 上移
WorksSection onMounted：gsap.from(card, { y: 15 }) ← 卡片再次被設為 y:15
```

執行時序：
1. 頁面過渡啟動，整個 Works 頁面正在從 `y:15` 平滑移動到 `y:0`
2. `await nextTick()` 後，WorksSection 動畫啟動，將卡片**重設回 y:15**
3. 卡片因為被「重置」而明顯跳動一下，才再度向上移回 `y:0`

### 🎯 修正方式

**頁面切換（y 方向）與元件動畫（y 方向）不能同時作用在同一元素上。**

解法：保留標題的 `x` 方向動畫（與頁面 y 不衝突），卡片改為**僅用 opacity**，不再指定 `y` 移動：

```javascript
// 修改前（會疊加產生彈跳）
gsap.from(cardRef.value, { opacity: 0, y: 15, duration: 0.4, delay: 0.1 })

// 修改後（只改透明度，無 y 軸衝突）
gsap.from(cardRef.value, { opacity: 0, duration: 0.4, delay: 0.15 })
```

### 📚 基礎知識：動畫設計的軸向原則

在多層動畫架構中，**不同層級的動畫應負責不同的軸向**，避免對同一屬性重複操作：

| 動畫層級 | 負責的效果 | 屬性 |
|---------|---------|------|
| 頁面切換（App.vue） | 整體入場方向感 | `opacity` + `y`（垂直滑入） |
| 元件標題 | 方向性進場（不同軸） | `opacity` + `x`（水平滑入）|
| 元件卡片 | 淡入（無軸衝突） | `opacity` 只 |
| 元件列表 stagger | 層次感 | `opacity` + `y`（小幅，延後執行） |

stagger 動畫中的小幅 `y` 之所以不衝突，是因為頁面切換（0.35s）比 stagger delay（0.1s + 動畫時間）更早完成，兩者時間上不重疊。

---

## [2026-05-30] 🐛 Bug 修復：GSAP inline style 殘留造成元素消失與半透明遮罩

### 📁 異動檔案
- `src/components/ProfileCard.vue` — 按鈕消失問題修復
- `src/components/SkillsSection.vue` — 技能列表半透明遮罩修復
- `src/components/WorksSection.vue` — 同步預防性修復

### ❓ 為什麼發生？

**Bug 1（ProfileCard 按鈕消失）**
GSAP 的 `from()` 動畫執行時，先將元素設為起始值（`opacity: 0`），動畫完成後再清除 inline style。若 timeline 中某個前序動畫出錯導致 timeline 中斷，後續的按鈕動畫永遠不會完成，`opacity: 0` 的 inline style 就會殘留，按鈕永久消失。

**Bug 2（SkillsSection 半透明遮罩）**
App.vue 的頁面切換動畫與 SkillsSection 的卡片動畫**同時觸發**，兩層 `opacity` 動畫疊加相乘：

```
視覺透明度 = 父層（頁面）opacity × 子層（卡片）opacity
           = 0.4（頁面過渡中）× 0.2（卡片動畫中）= 0.08
```

切換分類後 `v-for` 產生新的 DOM 節點（無 GSAP inline style），才「恢復正常」。

### 🎯 修正方式：三管齊下

**1. `nextTick` — 讓頁面過渡先行**
```javascript
onMounted(async () => {
  await nextTick()  // 等 Vue 完成 DOM 更新後再啟動元件動畫
  // 此時頁面過渡動畫已在進行中，兩者不再於同一 frame 競爭
  ...
})
```

**2. `clearProps: 'all'` — 動畫完成後強制清除 inline style**
```javascript
gsap.from(el, {
  opacity: 0, y: 10,
  clearProps: 'all'  // 動畫結束時移除所有 GSAP 注入的 inline style
})
```

**3. `gsap.context()` + `onUnmounted` — 元件卸載時徹底清理**
```javascript
let gsapCtx = null

onMounted(async () => {
  await nextTick()
  gsapCtx = gsap.context(() => {
    gsap.from(...)  // 所有動畫放在 context 內統一追蹤
  })
})

onUnmounted(() => gsapCtx?.revert())  // kill 所有 tween + 清除 inline style
```

### 📚 基礎知識：GSAP 殘留的四種預防方法

| 方法 | 時機 | 說明 |
|------|------|------|
| `clearProps: 'all'` | 動畫**正常完成**後 | 在 `vars` 中加入，動畫結束時自動清除 inline style |
| `tween.kill()` | 手動中止 | 儲存 tween 參考，需要時呼叫 `.kill()` |
| `gsap.killTweensOf(el)` | `onUnmounted` | 不需儲存參考，依目標元素清除所有 tween |
| `gsap.context().revert()` | `onUnmounted` | **推薦**：追蹤 context 內所有動畫，一次 kill + 清除 |

#### `onUnmounted` 能清除 GSAP 殘留嗎？

可以，但必須搭配正確的清理 API：

```javascript
// ❌ 沒用 — onUnmounted 本身不會清除 GSAP
onUnmounted(() => { /* 什麼都不做 */ })

// ✅ 方法 A：killTweensOf（簡單，單一元素）
onUnmounted(() => gsap.killTweensOf(el.value))

// ✅ 方法 B：context.revert()（推薦，覆蓋整個元件）
let ctx = null
onMounted(() => { ctx = gsap.context(() => { gsap.from(...) }) })
onUnmounted(() => ctx?.revert())
```

#### `gsap.context()` 的設計意圖

GSAP 3.11+ 針對 React / Vue 等元件框架設計，解決「元件卸載後動畫仍在記憶體中」的問題：
- 追蹤 context 內所有建立的 tween 與 timeline
- `revert()` 時不只 kill，還會**還原所有 inline style** 到 GSAP 介入前的狀態
- 可傳入根元素作為 scope，只追蹤該元素的後代節點

```javascript
// scope 參數限制只追蹤 rootRef 內的元素（避免誤殺其他地方的同名元素）
gsapCtx = gsap.context(() => {
  gsap.from('.skill-card', { opacity: 0 })
}, rootRef)
```

---

## [2026-05-30] ✨ 新增：GSAP 頁面與元件進場動畫

### 📁 異動檔案
- `src/App.vue` — 頁面切換動畫（`<Transition>` + GSAP hooks）
- `src/components/WorksSection.vue` — 標題滑入 + 卡片浮起
- `src/components/SkillsSection.vue` — 標題滑入 + 技能卡片 stagger
- `src/components/ProfileCard.vue` — timeline 依序進場

### 🎯 實作重點

#### Layer 1 — App.vue 頁面切換

```html
<router-view v-slot="{ Component, route }">
  <Transition :css="false" mode="out-in" @enter="onEnter" @leave="onLeave">
    <component :is="Component" :key="route.path" />
  </Transition>
</router-view>
```
```javascript
import { gsap } from 'gsap'

const onEnter = (el, done) => {
  gsap.from(el, { opacity: 0, y: 15, duration: 0.35, ease: 'power2.out', onComplete: done })
}
const onLeave = (el, done) => {
  gsap.to(el, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in', onComplete: done })
}
```

#### Layer 2 — WorksSection / SkillsSection 標題 + 卡片

```javascript
onMounted(() => {
  gsap.from(titleRef.value, { opacity: 0, x: -20, duration: 0.45, ease: 'power2.out' })
  gsap.from(cardRef.value,  { opacity: 0, y: 15,  duration: 0.4,  delay: 0.1, ease: 'power2.out' })
})
```

#### Layer 3 — SkillsSection 技能卡片 stagger

```javascript
gsap.from(skillListRef.value.children, {
  opacity: 0, y: 10, duration: 0.35,
  stagger: 0.06, delay: 0.1, ease: 'power2.out'
})
```

#### Layer 4 — ProfileCard timeline 依序進場

```javascript
const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

tl.from(imageRef.value,    { opacity: 0, x: -20, duration: 0.5 })
  .from(tagRef.value,      { opacity: 0, y: 10,  duration: 0.3  }, '-=0.15')
  .from(headlineRef.value, { opacity: 0, x: -15, duration: 0.4  }, '-=0.15')
  .from(bioRef.value,      { opacity: 0, y: 10,  duration: 0.35 }, '-=0.1')
  .from(btnsRef.value.children, { opacity: 0, y: 8, duration: 0.3, stagger: 0.08 }, '-=0.1')
```

---

### 📚 基礎知識：GSAP 核心概念

#### 1. 安裝與引用

```bash
npm install gsap
```
```javascript
import { gsap } from 'gsap'  // 具名引入，tree-shaking 友善
```

#### 2. 三個基本方法

| 方法 | 說明 | 範例 |
|------|------|------|
| `gsap.to(el, vars)` | 從**目前狀態**動畫到指定值 | `gsap.to(el, { opacity: 0 })` 讓元素淡出 |
| `gsap.from(el, vars)` | 從指定值動畫到**目前狀態** | `gsap.from(el, { opacity: 0 })` 讓元素淡入 |
| `gsap.fromTo(el, from, to)` | 完整指定起點與終點 | 需要精確控制兩端時使用 |

**本專案用 `gsap.from()` 的原因**：元素的最終狀態就是 CSS 設定的正常狀態，只需指定「從哪裡來」，GSAP 自動以現有樣式為終點。

#### 3. 常用 `vars` 參數

```javascript
gsap.from(el, {
  opacity: 0,          // 透明度
  x: -20,             // 水平位移（px）
  y: 15,              // 垂直位移（px）
  scale: 0.95,        // 縮放
  duration: 0.4,      // 動畫時長（秒）
  delay: 0.1,         // 延遲開始（秒）
  ease: 'power2.out', // 緩動函式
  stagger: 0.06,      // 多元素時的依序延遲（秒）
  onComplete: done    // 動畫結束時的回呼函式
})
```

#### 4. `ease`（緩動函式）對比

| ease | 視覺感受 | 適用情境 |
|------|---------|---------|
| `power2.out` | 快入慢出，自然減速 | 元素進場（推薦） |
| `power2.in` | 慢入快出，加速消失 | 元素離場 |
| `power3.out` | 更強的快入慢出 | 需要存在感的元素 |
| `back.out(1.2)` | 結尾有輕微彈跳感 | 按鈕、圖示等互動元素 |
| `linear` | 勻速 | 旋轉動畫、Loading 等 |

#### 5. `gsap.timeline()` — 序列動畫

```javascript
const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

tl.from(el1, { opacity: 0, duration: 0.3 })
  .from(el2, { opacity: 0, duration: 0.3 })        // el1 結束後才開始
  .from(el3, { opacity: 0, duration: 0.3 }, '-=0.1') // 與前一個重疊 0.1s
  .from(el4, { opacity: 0, duration: 0.3 }, '+=0.2') // 前一個結束後再等 0.2s
```

`defaults` 讓所有子動畫共用設定，不需重複撰寫。

#### 6. `stagger` — 多元素依序動畫

```javascript
// 對一個容器的所有子元素套用 stagger
gsap.from(container.children, {
  opacity: 0, y: 10,
  stagger: 0.06,  // 每個元素相差 0.06 秒開始
  duration: 0.35
})
```

`container.children` 是原生 DOM 的 `HTMLCollection`，GSAP 直接接受。

#### 7. Vue `<Transition>` 與 GSAP 的配合

Vue 的 `<Transition>` 支援兩種模式：

**CSS 模式（預設）**：Vue 自動加/移除 `.v-enter-active`、`.v-leave-to` 等 class，你在 CSS 中定義 transition。

**JS 模式（本專案使用）**：加上 `:css="false"` 告訴 Vue 不操作任何 CSS class，改由 `@enter`、`@leave` 等 hook 手動控制，讓 GSAP 完全接管。

```html
<Transition
  :css="false"          <!-- 關閉 Vue 的 CSS transition -->
  mode="out-in"         <!-- 舊頁完全離場後新頁才進場 -->
  @enter="onEnter"      <!-- 進場 hook，需呼叫 done() -->
  @leave="onLeave"      <!-- 離場 hook，需呼叫 done() -->
>
```

**`done` callback 的重要性**：Vue 需要知道動畫何時結束，才能移除/新增 DOM。若不呼叫 `done()`，`mode="out-in"` 會永遠等待舊頁離場完成，導致新頁面永不出現。GSAP 的 `onComplete` 是正確的呼叫位置。

#### 8. 版本 B（明顯有感）調整參考值

若日後想切換到更強烈的動畫效果，將以下數值替換：

```javascript
// 版本 A（目前，克制微動）
{ opacity: 0, y: 15, x: -20, duration: 0.35~0.45, stagger: 0.06, ease: 'power2.out' }

// 版本 B（明顯有感）
{ opacity: 0, y: 35, x: -40, duration: 0.5~0.65, stagger: 0.1, ease: 'power3.out' }
// 卡片可加入 scale: 0.96，按鈕可改用 ease: 'back.out(1.2)'
```

---

## [2026-05-30] 💬 本次互動分析與日後改善建議

### 使用者互動表現

**做得很好的地方：**

| 行為 | 具體例子 | 效果 |
|------|---------|------|
| **逐步確認再繼續** | 每個 Step 都等畫面確認才說繼續 | 避免在錯誤基礎上疊加更多修改 |
| **主動提問而非直接接受** | 詢問 `<a>` 改 `<button>` 的必要性 | 釐清語意 HTML 概念，做出正確決策 |
| **評估後再決定** | Scroll Hint 與 row/column 排版都先詢問建議 | 讓改動有依據，而非隨意試錯 |
| **要求文件同步** | 每步驟要求記錄至 `updateDetail.md` | 知識留存，未來不需重新推導 |
| **要求定位註解** | 「請在修改位置加簡單註解」 | 主動建立可維護性習慣 |

**可以改善的地方：**

**1. 需求描述可以更具體**
```
目前：「降低手機版整體的高度讓畫面更緊湊」

更好：「手機版卡片高度目前約 700px，希望縮到 500px 以內，
       主要覺得圖片下方的空白太多」
```
越具體的視覺描述，越能精準找到問題根源（這次需要額外推導是 `min-height` 和 `padding` 造成的）。

**2. 視覺確認可以描述觀察到的現象**
```
目前：「畫面正常 step 1 完成」

更好：「畫面正常，深色模式下背景色也維持米白色了，step 1 完成」
```
能確認修改真正生效，而非只是「沒有明顯錯誤」。

**3. 可以更早說出最終偏好**

Step 7 的 `flex: 1` vs `width: 100%`：推薦 `flex: 1`，最後選 `width: 100%`。若一開始就說「我傾向每個按鈕獨占一整行」，就能直接跳到正確方向，省去中間的往返。

---

### Claude 的表現檢討

**失誤紀錄：**

**1. 移除 `ref` import（Step 5）— 最嚴重**
- **問題**：只看到 `systemFeeds` 改用 `computed`，就判斷 `ref` 已無用途，沒有掃描整個 script 區塊確認所有使用位置
- **教訓**：修改 import 前，應先搜尋檔案內所有 `ref(` 的使用位置

**2. WorksView.vue 字串替換失敗（Step 5）**
- **問題**：記憶中的文字與檔案實際內容有一字之差（拼字檢查器調整過內容），直接用舊版本字串找不到
- **教訓**：修改複雜內容前先 Read 確認當前狀態，不依賴記憶中的版本

**3. `flex: 1` 推薦與最終選擇不符**
- **問題**：從技術角度推薦 `flex: 1`，但沒有充分了解對視覺效果的預期
- **教訓**：給建議時一併描述視覺結果的差異，讓決策基於外觀而非技術名詞

---

### 日後更好的合作方式

**下指令的最佳格式：**
```
「手機版的詳細介紹和 Demo 按鈕，
 希望各自佔半行並排，愛心維持原本的小圓圈。
 先說你的做法再動手。」
```
包含：**視覺預期** + **例外情況** + **確認計畫再執行**

**建議建立的工作習慣：**

| 時機 | 建議動作 |
|------|---------|
| 完成一個功能區塊 | `git commit` 做一個 checkpoint，方便還原 |
| 要改動較多檔案前 | 說「先列出計畫」，確認方向再執行 |
| 視覺修改後 | 描述看到的畫面變化，而非只說「正常」 |
| 有偏好但不確定技術術語 | 直接描述「想要 A 樣子」，由 Claude 找對應做法 |

**總評：** 整體合作流暢，逐步確認的節奏讓整個修復過程沒有走錯方向。主要的浪費都來自操作疏失（import 掃描不夠、字串確認不夠），這些可以靠「修改前先讀檔」這個習慣完全避免。

---

## [2026-05-31] ✨ 新增：全站 Web Font — Albert Sans

### 📁 異動檔案
- `index.html` — 新增 Google Fonts `<link>`（preconnect + stylesheet）
- `src/App.vue` — `body font-family` 改為 `'Albert Sans', 'Helvetica Neue', Arial, sans-serif`

### ❓ 為什麼需要？
原字體 `Helvetica Neue` 是 macOS/iOS 內建字體，Windows 系統沒有此字型會 fallback 到 Arial，導致跨平台顯示不一致。引入 Google Font 確保所有系統顯示相同字體。

`Albert Sans` 特性：幾何風格現代無襯線，線條乾淨，與作品集的極簡暖調風格相符。

### 🎯 實作方式

```html
<!-- index.html — preconnect 先建立 DNS 連線，加快字體載入 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

載入的字重：300 / 400 / 500 / 600 / 700（正體）+ 400 italic（斜體，供姓名 `.highlight` 對比）

### 設計注意：保留 `.highlight` 的 serif 對比

`ProfileCard.vue` 的姓名使用 `font-family: serif; font-style: italic`，與全站 Albert Sans 形成**無襯線 vs 有襯線**的字型對比，讓姓名視覺上更突出，這是刻意保留的設計決策。

### 📚 基礎知識：Google Fonts 最佳載入方式

```html
<!-- Step 1: preconnect — 提前建立 DNS + TLS 連線，節省 ~150-300ms -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Step 2: 只載入需要的字重，避免不必要的網路請求 -->
<!-- &display=swap — 文字先用 fallback 字體顯示，字體載入後再替換（FOUT），避免 FOIT（不可見文字） -->
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,400;0,600&display=swap" rel="stylesheet" />
```

**字重選擇原則**：每多載入一個字重約增加 20-40KB 網路請求，只載入實際用到的：
- 400: 內文
- 500: 標籤、按鈕
- 600: 標題、強調
- 700: 大標題
- 300 / italic: 視需求選用

---

## [2026-05-31] ✨ 新增：Shadow Elevation System（陰影立體感）

### 📁 異動檔案
- `src/App.vue` — `:root` 新增 `--shadow-sm/md/lg` 三層 Token
- `src/components/NavBar.vue` — 頁首加入 `drop-shadow`
- `src/components/WorksSection.vue` — `project-card` 靜態 + hover 陰影；`system-feed-card` 靜態陰影
- `src/components/SkillsSection.vue` — `skills-wrapper` 與 `system-feed-card` 靜態陰影
- `src/components/SkillCard.vue` — hover 與 active 狀態加入陰影
- `src/components/ProfileCard.vue` — 硬編碼陰影改為 `--shadow-lg` Token
- `src/components/ProjectCardDetail.vue` — `detail-container` 靜態陰影

### ❓ 為什麼需要？
原本大部分卡片靠「白色 vs 米色背景」的顏色差異產生視覺區隔，平面感明顯。依照 `ui-ux-pro-max` Skill 的 `elevation-consistent` 規則，需要建立一致的陰影層次系統。

### 🎯 設計決策：暖棕調陰影

使用 `rgba(70, 50, 30, x)` 而非純黑 `rgba(0, 0, 0, x)`，原因：
- 背景色 `#EBE4DB` 為暖米色，純黑陰影會有冷色感與背景脫節
- 暖棕調陰影有如紙張疊放的自然光影，與整體設計語言一致

```css
:root {
  --shadow-sm: 0 2px 8px rgba(70, 50, 30, 0.07);   /* NavBar */
  --shadow-md: 0 4px 16px rgba(70, 50, 30, 0.10);  /* 一般卡片 */
  --shadow-lg: 0 12px 32px rgba(70, 50, 30, 0.13); /* 主視覺、hover */
}
```

### 🎯 Elevation 應用對應表

| 元素 | 層級 | 行為 |
|------|------|------|
| NavBar | `filter: drop-shadow(sm)` | 靜態，與內容區分 |
| `project-card` | `--shadow-md` → hover `--shadow-lg` | 靜態 + hover 提升 |
| `system-feed-card`（Works/Skills）| `--shadow-md` | 靜態 |
| `skills-wrapper` | `--shadow-md` | 靜態 |
| `skill-card` | hover/active `--shadow-md` | 互動狀態 |
| `profile-image-wrapper` | `--shadow-lg` | 主視覺強調 |
| `detail-container` | `--shadow-md` | 靜態 |
| `performance-card` | 不加（深色背景自帶對比） | — |

### 📚 基礎知識：box-shadow vs filter: drop-shadow

| | `box-shadow` | `filter: drop-shadow()` |
|--|-------------|------------------------|
| **作用對象** | 矩形邊界框（border-box）| 實際渲染的像素形狀 |
| **圓角** | 跟隨 `border-radius` ✅ | 跟隨實際形狀 ✅ |
| **透明元素** | 不穿透透明區域 | 穿透透明區域，貼合形狀 |
| **效能** | GPU 加速 ✅ | 需要合成層，較耗效能 |
| **適用情境** | 一般卡片、按鈕 | SVG、PNG（有透明背景）、複雜形狀 |

NavBar 使用 `filter: drop-shadow` 是因為它不是一個有邊框的卡片，而是一個透明背景的橫條，讓陰影效果更自然。

---

## [2026-05-30] 📋 第二階段總結：作品資料補足 + GSAP 動畫實作

### 完成項目一覽

#### Part 2 — 真實作品資料補足

| 項目 | 內容 |
|------|------|
| 圖片路徑 | 修正 `/public/` 前綴錯誤、雙斜線、kebab-case ID |
| 元件圖片顯示 | WorksSection / ProjectCardDetail 替換 placeholder，加入 `object-fit: cover` |
| 真實資料填入 | 三個專案完整填寫（title、tags、overview、architecture、role、timeline、feeds）|
| Lighthouse 分數 | 新增 `performance` 欄位，元件動態顯示分數與錯誤狀態 |
| About 頁面 | bio 改為版本 B（設計師 → 咖啡師 → 開發者）、title 改為 `Developer` |

#### Part 1 — GSAP 動畫

| 項目 | 內容 |
|------|------|
| 頁面切換 | App.vue 純 opacity 淡入淡出（移除 y 軸避免彈跳）|
| 元件進場 | WorksSection、SkillsSection 標題 x 滑入、卡片 stagger |
| ProfileCard | timeline 依序進場（圖片 → tag → 標題 → bio → 按鈕）|
| Bug 修復 | `nextTick` + `gsap.context` + `clearProps` 解決 inline style 殘留 |
| Bug 修復 | 移除頁面過渡 `y: 15` 解決 Works 頁彈跳 |

#### 版面調整

| 項目 | 內容 |
|------|------|
| 全站底部留白 | `.main-content` 加 `padding-bottom: var(--space-8)` |
| Works/Skills 高度 | `min-height` 改為 `clamp(380px, 55dvh, 480px)` |
| 圖片高度上限 | `.project-image max-height: 460px`（根本解決高度問題）|
| 欄間距 | `gap: var(--space-5)` 增加視覺呼吸感 |
| ProjectCardDetail scrollbar | 元件層補強隱藏，防止 Windows 環境閃現 |

---

### 💬 本次互動分析與建議

#### 使用者表現

**做得好的部分：**

- **用實測數字說話**：「90% 縮放時比例最對」、「gap 加到 6rem 接近預期但太大」，具體的觀測讓問題快速收斂，比說「感覺不對」節省大量溝通成本
- **自己測試出關鍵數字**：`max-height: 460px` 是使用者測試後確認的正確值，比計算值 260px 更準確。實際測試比理論推算更可靠
- **問題描述越來越清楚**：後期的問題描述（scrollbar 出現、彈跳感）都很明確，讓分析更有效率

**可以改善的部分：**

**① 描述 bug 時加上「在哪個狀態下發生」**
```
目前：「Works 頁面會彈跳一下」

更完整：「從 About 切換到 Works 時，頁面進場瞬間卡片往上跳，
         切換到其他頁面不會，只有 Works 有這個問題」
```
這樣的描述能讓 Claude 第一次就鎖定到「Works 頁面內容超長 + 頁面過渡 y 值」，而不是先修卡片動畫、再修頁面過渡，走了兩步。

**② 視覺確認時描述「什麼改變了」**
```
目前：「沒問題，繼續下一步」

更完整：「Works 頁面的彈跳消失了，切換到 Skills 和 About 也確認正常」
```
幫助確認修改範圍是否符合預期，避免修復 A 但影響 B 的情況沒被察覺。

---

#### Claude 的表現檢討

**三個需要改進的地方：**

**① 高度問題的診斷順序錯誤**

實際走的路：修改 `min-height` → 無效 → 測試 gap → 分析 → `max-height` → 有效

正確路徑：先讀取圖片容器的 `aspect-ratio` + 欄位寬度，計算出圖片實際高度 ~480px > `min-height`，直接提出 `max-height` 解法。

**改正方法**：修改涉及 height/layout 的問題時，先用計算確認「實際高度由誰決定」，不假設 `min-height` 是瓶頸。

**② GSAP 動畫 bug 需要多輪修復**

按鈕消失、半透明遮罩、彈跳感三個 bug 是分開發現和修復的。設計動畫架構時就應預見：
- 頁面過渡與元件動畫同軸會衝突 → 事先分離軸向
- GSAP inline style 殘留 → 事先加 `clearProps + gsap.context`

**改正方法**：下次實作 GSAP 動畫時直接套用完整防護結構（nextTick + context + clearProps），不等 bug 出現再修。

**③ Windows 滾動條問題判斷不夠果斷**

分析了很多種可能性，實際上結論很明確：style.css 全域已隱藏，Windows 環境補加元件層是標準做法，應直接執行。

---

#### 日後合作建議

**使用者習慣建立：**

| 時機 | 建議做法 |
|------|---------|
| 描述 bug | 說明「重現步驟」：從哪個頁面、做了什麼、才出現問題 |
| 確認修復 | 說出觀察到的變化，而非只說「沒問題」 |
| 視覺測試 | 確認三面向：目標頁面修好、其他頁面未受影響、手機版正常 |
| 提供數字 | 測試後直接給具體值（如 460px），比描述感覺更有效率 |

**Claude 改進承諾：**

| 情境 | 改進方式 |
|------|---------|
| 版面高度問題 | 先算清楚哪個元素控制高度再提建議 |
| GSAP 動畫 | 一次性套用完整防護模式，不等 bug 出現再補 |
| Windows 環境問題 | 直接執行業界標準做法，減少過度分析時間 |

---

## [2026-05-30] 📐 專案資料流向完整解析

### 一、整體架構鳥瞰

```
瀏覽器輸入 URL
      ↓
  Vue Router          ← 決定渲染哪個 View
      ↓
  App.vue             ← 根容器，提供全域 CSS 變數與佈局
   ├── NavBar.vue     ← 純 UI，無資料依賴
   └── <router-view> ← 動態插槽，由 Router 決定內容
        ├── AboutView.vue   (Smart)
        ├── SkillsView.vue  (Smart)
        └── WorksView.vue   (Smart)

useLikes.js           ← 獨立於元件樹的全域狀態（Composable Singleton）
```

**Smart（智慧）元件**：負責持有資料、操控 Router、調用 Composable  
**Dumb（展示）元件**：只接收 Props 顯示畫面、透過 Emit 向上回報事件，不直接依賴任何外部狀態

---

### 二、About 頁面資料流

```
AboutView.vue
│
│  profileData (ref) — 本地假資料
│  { name, title, avatar, bio, links[] }
│
└─ :profile="profileData" ──────────────► ProfileCard.vue
                                          │
                                          │  接收 profile prop
                                          │  渲染姓名、標題、bio
                                          │
                                          └─ profile.links[] ──► <a target="_blank">
                                                                  開啟外部連結
```

**資料方向**：單向，由上（View）往下（Component）流，無 Emit 回傳

---

### 三、Skills 頁面資料流

```
SkillsView.vue
│
│  skillCategories (ref) — 多層巢狀假資料
│  [ { id, title, skills: [ { id, name, logo, rating, description } ] } ]
│
└─ :categories="skillCategories" ──────► SkillsSection.vue
                                          │
                                          │  內部狀態（Dumb 元件自管 UI 狀態）
                                          │  activeCategoryIndex (ref)  ← 點擊圓點更新
                                          │  currentCategory (computed) ← 根據 index 衍生
                                          │  activeSkill (ref)          ← 點擊卡片更新
                                          │  isScrolled (ref)           ← scroll 事件更新
                                          │
                                          │  targetSize (computed)  ← 由 activeSkill.rating 衍生
                                          │  targetColor (computed) ← 由 activeSkill.rating 衍生
                                          │
                                          ├─ v-for skill in currentCategory.skills
                                          │   :skill="skill" ──────────► SkillCard.vue
                                          │   :isActive="activeSkill.id === skill.id"   │
                                          │   @click="selectSkill(skill)" ◄─────────────┘
                                          │              （點擊後更新 activeSkill）
                                          │
                                          └─ 右側卡片直接讀取 activeSkill 的屬性渲染
```

**資料方向**：View → Section（Props），Section → Card（Props），Card → Section（Emit/Click）

---

### 四、Works 頁面資料流（最複雜）

#### 4-1 路由層判斷

```
URL: /work          → route.params.id = undefined
URL: /work/nexus-analytics → route.params.id = 'nexus-analytics'
                                    ↓
WorksView.vue
  projects (ref) — 完整假資料
  [ { id, title, tags, demoUrl, githubUrl, role, timeline,
      overview, architecture, feeds[] } ]

  currentProject (computed)
    = projects.find(p => p.id === route.params.id) || null

  isDetailView (computed)
    = !!currentProject.value
    ↓
  ┌─ false → 渲染 WorksSection（列表）
  └─ true  → 渲染 ProjectCardDetail（詳細）
```

#### 4-2 列表模式（WorksSection）

```
WorksView.vue
│
│  :projects="projects" ─────────────────► WorksSection.vue
│  @navigate-to-detail="goToProjectDetail" │
│    → router.push('/work/' + projectId)   │  內部狀態
│                                          │  activeProjectIndex (ref)
│                                          │  activeProject (computed)
│                                          │    = projects[activeProjectIndex]
│                                          │  systemFeeds (computed)
│                                          │    = activeProject.feeds
│                                          │
│                                          │  useLikes() ◄── useLikes.js（全域）
│                                          │  isLiked(id), toggleLike(id)
│                                          │
│                                          └─ emit('navigate-to-detail', projectId)
│                                              ↑ 點擊「詳細介紹」按鈕觸發
```

#### 4-3 詳細模式（ProjectCardDetail）

```
WorksView.vue
│
│  currentProject (完整物件) ────────────► ProjectCardDetail.vue
│  @navigate-back="handleGoBack"           │
│    → router.push('/work')                │  接收 project prop
│                                          │  project.title, tags, overview...
│                                          │
│                                          │  useLikes() ◄── useLikes.js（全域）
│                                          │  isProjectLiked (computed)
│                                          │    = isLiked(project.id)
│                                          │
│                                          │  window scroll ──► isPageScrolled (ref)
│                                          │    → scroll-hint-fixed 淡出/淡入
│                                          │
│                                          └─ emit('navigate-back')
│                                              ↑ 點擊「← Back」按鈕觸發
```

---

### 五、全域狀態：`useLikes.js` 資料流

```
useLikes.js（模組層級，所有呼叫者共享同一份記憶體）
│
│  likedProjects (ref) ← 宣告在 export function 外部，成為單例
│  isInitialized (let)
│
│  第一次被任何元件呼叫時：
│    localStorage.getItem('portfolio_likes')
│      → JSON.parse() → likedProjects.value
│    watch(likedProjects, deep: true)
│      → JSON.stringify() → localStorage.setItem(...)
│
├─ WorksSection.vue 呼叫 useLikes()
│    isLiked(activeProject.id) → 列表卡片愛心顯示
│    toggleLike(id) → 點擊愛心 → likedProjects 更新 → 自動同步 localStorage
│
└─ ProjectCardDetail.vue 呼叫 useLikes()
     isLiked(project.id) → 詳細頁愛心顯示（與列表即時同步）
     toggleLike(id) → 同上
```

**關鍵**：兩個元件拿到的是**同一個 `ref`** 的參考，任一邊改動，另一邊畫面即時更新。

---

### 六、完整資料流向總覽

```
localStorage ←──────────────────────── useLikes.js (Singleton)
                                          ↑         ↑
                                    WorksSection  ProjectCardDetail
                                          ↑              ↑
                              projects prop         project prop
                                          ↑              ↑
                                    WorksView.vue (Smart)
                                          ↑
                                    Vue Router
                                    route.params.id
                                          ↑
                                    瀏覽器 URL
```

---

### 七、日後擴充的運用方式

#### A. 新增專案：只需修改 `WorksView.vue`

```javascript
// 在 projects 陣列加入新物件即可，不需動任何元件
projects.value.push({
  id: 'new-project',
  title: 'New Project',
  tags: ['Vue', 'TypeScript'],
  demoUrl: '...',
  githubUrl: '...',
  role: '...',
  timeline: '...',
  overview: '...',
  architecture: '...',
  feeds: [ ... ]
})
```
列表輪播圓點、詳細頁資料會**自動更新**，因為所有顯示都是資料驅動的。

#### B. 串接真實 API：只需修改 Smart Component

```javascript
// WorksView.vue — 從 ref 假資料改為 API 呼叫
import { ref, onMounted } from 'vue'

const projects = ref([])

onMounted(async () => {
  const res = await fetch('/api/projects')
  projects.value = await res.json()
})
// Dumb Component（WorksSection、ProjectCardDetail）完全不需改動
```

#### C. 新增收藏頁面：直接使用 `useLikes`

```javascript
// FavoritesView.vue（新頁面）
import { useLikes } from '../composables/useLikes.js'
import { computed } from 'vue'

const { likedProjects } = useLikes()
// likedProjects 與 WorksSection / ProjectCardDetail 完全同步
// 不需要任何額外設定
```

---

### 📚 延伸基礎知識

#### 1. 單向資料流（One-way Data Flow）

Vue 與 React 都採用**從上往下**的單向資料流：

```
Parent (資料擁有者)
  │
  │  Props（向下傳遞資料）
  ▼
Child (資料使用者)
  │
  │  Emit（向上回報事件）
  ▼
Parent (決定如何處理)
```

**為什麼不讓子元件直接修改 Props？**
- Vue 會在開發環境警告 `[Vue warn]: Mutating prop directly`
- 若允許子元件隨意修改，資料的修改來源變得難以追蹤（任何地方都可能改）
- 強制「事件向上回報、資料向下傳遞」讓資料流向清晰，Debug 時只需往上找

#### 2. Composable vs Pinia：何時該升級？

| 情境 | useLikes（Composable） | Pinia（狀態管理） |
|------|----------------------|-----------------|
| 狀態數量 | 少量（1~3 個功能） | 多個複雜狀態 |
| 跨頁面共用 | ✅ 可以（模組單例） | ✅ 可以 |
| DevTools 支援 | ❌ 無時間軸追蹤 | ✅ 完整時間軸、快照 |
| 適合專案規模 | 中小型 Portfolio | 中大型應用 |

本專案目前用 Composable 完全足夠，當狀態增多（如：購物車、使用者登入、多種收藏類型）才需升級至 Pinia。

#### 3. `computed` 的快取機制

```javascript
// currentProject 只在 route.params.id 改變時重新計算
// 其他任何操作（點擊、hover、切換技能）都不會觸發重算
const currentProject = computed(() =>
  projects.value.find(p => p.id === route.params.id) || null
)
```

`computed` 會**快取**上次的結果，只有依賴的響應式資料（此例為 `route.params.id` 和 `projects`）改變時才重新執行。相比之下，直接寫成 `methods` 的函式每次渲染都會重新執行，在資料量大時會有效能差異。

#### 4. 路由參數 vs Query String

本專案用 `/work/:id`（路由參數）而非 `/work?id=xxx`（Query String），兩者差異：

| | 路由參數 `/work/:id` | Query String `/work?id=xxx` |
|--|--------------------|-----------------------------|
| **語意** | ID 是頁面的主要識別 | ID 是篩選條件 |
| **書籤/分享** | ✅ URL 簡潔易讀 | URL 較長 |
| **可選性** | 可設為 `/:id?`（可選） | 本來就可有可無 |
| **適用情境** | 詳細頁、個別資源 | 搜尋、篩選、分頁 |

---

## [2026-05-30] 📋 階段總結：Bug 全面審查與修復

### 修復項目（Bug Fixes）

| # | 分類 | 說明 | 異動檔案 |
|---|------|------|---------|
| 1 | 🔴 嚴重 | 清除 `style.css` Vite 樣板殘留，移除全域樣式污染與意外 Dark Mode | `style.css` |
| 2 | 🟠 安全 | 所有 `target="_blank"` 補上 `rel="noopener noreferrer"`，防止 Tab-napping | `ProfileCard`, `WorksSection`, `ProjectCardDetail` |
| 3 | 🟠 功能 | `ProjectCardDetail` 資料全面動態化，從接收 ID 改為接收完整 project 物件 | `WorksView`, `ProjectCardDetail` |
| 4 | 🟡 品質 | `WorksSection` 萬用選擇器 `*` 改為精確的 `.feed-list` | `WorksSection` |
| 5 | 🟡 功能 | `systemFeeds` 移至各 project 資料內，切換專案時 Feed 跟著更新 | `WorksView`, `WorksSection` |
| 5b | 🟡 崩潰 | 修復誤刪 `ref` import 導致畫面崩潰（`ReferenceError: ref is not defined`） | `WorksSection` |
| 6 | 🔵 樣式 | Demo 按鈕（`<a>` 標籤）補上 `text-decoration: none` | `WorksSection` |
| 7 | 🔵 排版 | 手機版操作按鈕改回水平排列、移除 `min-height: 600px`、縮減卡片 padding | `WorksSection` |
| 8a–8e | 🔵 品質 | NavBar 重複 z-index、AboutView 多餘 padding、SkillsView 冗餘語法、SkillsSection 縮排、updateDetail.md 教學錯誤 | 5 個檔案 |

### 優化項目（UX Enhancement）

| # | 說明 | 異動檔案 |
|---|------|---------|
| UX | Scroll Hint 滾動後淡出，回頂後淡回，避免提示元素持續干擾視線 | `SkillsSection`, `ProjectCardDetail` |

### 關鍵學習（本階段整理）

- `defineEmits` / `defineProps` 是編譯器巨集，不需要也不能 `import`
- `<a target="_blank">` 必須搭配 `rel="noopener noreferrer"` 防止 Tab-napping
- Props 傳物件 vs 傳 ID 的架構取捨（Smart / Dumb Component 原則）
- `ref` vs `computed`：值可從其他狀態衍生時優先用 `computed`
- `window` 事件監聽必須在 `onUnmounted` 手動移除，防止 Memory Leak
- CSS `*` 萬用選擇器在 scoped 元件內仍影響所有子元素，應使用精確選擇器
- `flex: 1` vs `width: 100%`：多元素均分用 `flex: 1`，單元素填滿用 `width: 100%`
- CSS 載入順序與優先權：inline style 覆蓋 scoped CSS，靜態值應統一在 CSS 管理

### 統計
- 共審查 **10 個原始碼檔案**
- 共修復 **10 項問題**（含 1 項 UX 優化）
- `updateDetail.md` 新增紀錄約 **400 行**
- 所有修改位置均有 `[Fix]` / `[Feat]` 行內註解方便日後定位

---

## [2026-05-29] 技能頁面 (Skill) 與專案詳細頁 (ProjectCardDetail) 新增

### 🎯 實作重點
1. **Skill 頁面動態化元件新增**
   - 建立 `SkillSection.vue` 及 `SkillView.vue`，採用與 Works 一致的 `7:3:auto` 網格佈局。
   - 左側技能清單支援垂直滾動，內部由多個技能小卡組成 (Logo + 熟練度星等)。
   - 右側卡片動態連動：
     - **System Feed**：點擊卡片後動態顯示該技術的詳細文字說明。
     - **Performance 標靶圖**：基於所選星等 (1~5)，自動縮放大小並切換純色漸層的圓形標靶。

2. **WorksSection 延伸：ProjectCardDetail 頁面**
   - 原定 Contact 聯絡頁面改為實作專案的詳細頁面 `ProjectCardDetail.vue`。
   - 於 `WorksSection.vue` 專案卡片新增 `[詳細介紹]` 與 `[Demo]` 兩顆按鈕。
   - `ProjectCardDetail.vue` 包含頂部返回按鈕、專案大圖、Overview/Architecture 文字說明區塊，以及右側的 Role/Timeline/Links 資訊小卡。

3. **路由與導覽列更新**
   - `router/index.js` 新增 `/skill` 與動態路由 `/work/:id`。
   - `AppHeader.vue` 更新為：About、Skill、Work 連結。
   - 路由設定中加入了 `scrollBehavior`，確保跳轉至詳細頁面時視窗自動回到頂部。

---

## [2026-05-29] UI 版面一致性與質感優化 (後續微調)

### 🎯 實作重點
1. **修復版面溢出 (Overflow Fix)**
   - **問題**：`SkillSection.vue` 中 `system-feed-card` 若文字過多會撐高外層 `works-layout`，導致頁面高度忽長忽短。
   - **解決方案**：為 `system-feed-card` 設定 `min-height: 0`，並將內部 `.feed-list` 設定為 `overflow-y: auto` 及 `flex: 1`，讓長文字能在卡片內部平滑滾動，維持整體 Layout 高度一致。

2. **滾動條質感提升 (Scrollbar UI Enhancement)**
   - **範圍**：應用於左側技能清單 (`.skills-container`) 與右側文字說明 (`.feed-list`)。
   - **優化項目**：
     - **寬度 (Width)**：縮減為極細的 `4px`，使視覺更輕盈。
     - **軌道 (Track)**：設為透明無背景。
     - **滑塊 (Thumb)**：一般狀態使用半透明帶圓角的灰色 (`rgba(0, 0, 0, 0.15)`)，游標懸停 (Hover) 時會切換為主題 Accent 色，提升細節質感與互動性。

---

## [2026-05-29] WorksSection 組件重構：改用 Emit 處理路由

### 🎯 實作重點
1. **Mock Data 建立與資料綁定**
   - 在 `WorksSection.vue` 中建立 `projects` 陣列作為側邊專案的假資料 (Mock Data)。
   - 將樣板中原本寫死的資料 (如專案名稱、Tag、Demo 連結) 改為綁定 `activeProject` 的響應式資料。
2. **職責分離與 `emit` 實作**
   - 將原本直接負責跳轉的 `<router-link>` 更改為原生的 `<button>`。
   - 使用 `defineEmits(['navigate-to-detail'])` 宣告自訂事件，當點擊「詳細介紹」時發送帶有 `projectId` 的事件通知上層。
3. **上層路由掌控 (Programmatic Navigation)**
   - 修改 `WorksView.vue`，在樣板中監聽 `@navigate-to-detail`。
   - 透過 `vue-router` 的 `useRouter` hook，在父組件的函式中執行 `router.push('/work/' + projectId)`，完成畫面跳轉。
   - **目的**：這使得 `WorksSection` 成為一個純粹的 UI 呈現元件，不再依賴並耦合 Vue Router 的邏輯，未來可重用性更高。

### 📚 基礎知識解說 (實作教學與範例程式碼)

為了方便後續回顧，以下記錄本次重構的核心觀念與程式碼範例：

#### 1. 為什麼不用 `<router-link>`，而要用 `emit`？
想像 `WorksSection` 是一個「按鈕面板 (子元件)」，而 `WorksView` 是一個「遙控器主機 (父元件)」。
- **原本的做法 (`<router-link>`)**：按鈕面板自己內建了切換頻道的晶片。這意味著這個面板只能用在這個遙控器上，如果以後其他地方想重複使用這個面板但不想切換頻道，就會很麻煩。
- **現在的做法 (`emit`)**：按鈕面板只負責「被按」。當它被按時，它會發出一個電波 (`emit`) 告訴主機：「我被按了，代號是 001」。主機 (`WorksView`) 收到電波後，才決定要切換到哪一個頻道 (`router.push`)。
**好處**：這樣做叫做「職責分離 (Separation of Concerns)」，讓元件變得更純粹，它不依賴 Vue Router，只專心做好「顯示資料與發出事件」的工作。

#### 2. `defineEmits` 的用法 (子組件發送事件)
在 Vue 3 的 Composition API 中，子組件如果想要跟父組件說話，必須先「報備」自己會說哪些話。
```javascript
// WorksSection.vue (子組件)
// ⚠️ 注意：defineEmits 是編譯器巨集，不需要也不能 import（已於 Fix #ref 錯誤紀錄說明）

// 1. 宣告這個組件可以發出哪些事件
const emit = defineEmits(['navigate-to-detail'])

// 2. 在點擊按鈕時，發送事件並附帶資料 (projectId)
const handleDetailClick = () => {
  emit('navigate-to-detail', activeProject.value.id)
}
```
```html
<button @click="handleDetailClick" class="btn btn-details">詳細介紹</button>
```

#### 3. Programmatic Navigation (程式化導航)
在 HTML 中我們習慣用 `<a>` 標籤 (或 Vue 的 `<router-link>`) 讓使用者點擊跳轉。但如果我們想在「點擊按鈕後，先做點事情（例如存檔、判斷權限），再跳轉頁面」，我們就需要透過寫程式的方式來叫瀏覽器換頁。
```html
<!-- WorksView.vue (父組件) -->
<!-- 1. 在樣板中監聽自訂事件 -->
<WorksSection @navigate-to-detail="goToProjectDetail" />
```
```javascript
// WorksView.vue (父組件)
import { useRouter } from 'vue-router'

const router = useRouter()

// 2. 接收到事件後，執行實際的路由跳轉
const goToProjectDetail = (projectId) => {
  router.push(`/work/${projectId}`)
}
```

---

## [2026-05-29] 樣式修復與優化：隱藏滾動條與新增下滑提示 Icon

### 🎯 實作重點
1. **全域與區域滾動條隱藏**
   - 在 `style.css` 中，針對 `body` 設定隱藏全域原生滾動條，解決 `ProjectCardDetail` 頁面內容過長時滾動條出現導致版面往左跳動的問題。
   - 在 `SkillSection.vue` 中，利用 CSS 完全隱藏左側清單 (`.skills-container`) 與右側內容 (`.feed-list`) 的自訂滾動條。
2. **新增動態 Scroll Down 提示**
   - 由於隱藏了滾動條，為確保使用者體驗 (UX)，在 `SkillSection.vue` 技能列表底部與 `ProjectCardDetail.vue` 畫面底部 (Fixed) 加入了 `↓ Scroll for more` 的文字提示。
   - 使用 CSS Keyframes (`@keyframes bounce`) 加入了上下浮動的動畫效果，並設定 `pointer-events: none` 確保不會阻擋底下的點擊操作。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### 1. 如何完美隱藏原生 Scrollbar (跨瀏覽器)
在 Windows 作業系統中，原生滾動條具有實體寬度（通常是 15~17px），當頁面從「無需滾動」變成「需要滾動」時，會突然出現並擠壓畫面，造成惱人的版面跳動 (Layout Shift)。

**解法**：我們可以直接用 CSS 把它隱藏起來，但**依然保留滑鼠滾輪與觸控板的滾動能力**。
```css
/* 1. 隱藏 Chrome, Edge, Safari 的滾動條 */
body::-webkit-scrollbar {
  display: none;
}

/* 2. 隱藏 Firefox, IE 的滾動條 */
body {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
```

#### 2. CSS 動畫實作：懸浮的跳動箭頭 (Bouncing Animation)
為補足沒有滾動條的視覺缺失，我們製作了一個小動畫來引導使用者。這是利用 CSS 的 `@keyframes` 來控制元素的 Y 軸位移 (`translateY`)。
```css
/* 定義跳動動畫：在特定時間點改變位置，創造彈跳感 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px); /* 往上跳 5px */
  }
  60% {
    transform: translateY(-3px); /* 往上跳 3px */
  }
}

/* 將動畫套用到圖示上 */
.bounce-icon {
  display: inline-block;
  animation: bounce 2s infinite; /* 動畫持續 2 秒，無限循環 */
}
```

#### 3. UX 細節：`pointer-events: none` 的妙用
當我們把「向下滑動提示」使用 `position: absolute` 或 `position: fixed` 蓋在畫面上方時，它就像是一塊透明玻璃，可能會擋住底下專案卡片的點擊事件。
```css
.scroll-hint-fixed {
  position: fixed;
  bottom: 2rem;
  /* ...其他樣式... */
  
  /* 神奇的屬性：讓滑鼠事件穿透這個元素，就好像它不存在一樣！ */
  pointer-events: none; 
}
```
加上這行後，即使滑鼠點在「提示字眼」上，也能順利點擊到它背後的按鈕或連結。

---

## [2026-05-29] Bug 修正：SkillSection 初次載入爆版問題

### 🎯 實作重點
- **問題描述**：進入或重新整理 `SkillSection` 頁面時，左側的技能清單會撐破外層容器（失去捲動效果，導致版面變長）。但在點擊任意技能卡片後，版面又會神奇地縮回去恢復正常。
- **解決方案**：在左側的 Flex 容器 (`.project-card.skills-wrapper` 與 `.skills-container`) 加上了 `min-height: 0;`，強制作業系統的排版引擎不使用內容的實際高度，而是嚴格遵從外層容器 (`600px`) 的限制。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### Flex / Grid 佈局中的「內容撐破」現象 (Intrinsic Sizing)
這是一個非常經典的 CSS 佈局地雷，經常發生在使用 `display: flex` 或 `display: grid` 的滾動區域中。

1. **預設的自動最小高度 (`min-height: auto`)**
   預設情況下，Flex 項目與 Grid 項目的 `min-height` 屬性值不是 `0`，而是 `auto`。這意味著「如果裡面的內容很長，這個區塊就必須跟內容一樣長」，它會強迫無視你在它身上設定的 `flex: 1` 或外層高度限制。
2. **點擊後恢復正常的成因**
   當我們點擊技能卡片，觸發了 Vue 的重新渲染，瀏覽器會進行第二次版面重繪 (Reflow)。在某些瀏覽器的實作下，重繪時可能會剛好修復了這個初始載入高度計算錯誤的問題。
3. **終極解法**
   只要是「**裡面有很長內容需要滾動**」的 Flex 或 Grid 子元素，都應該明確加上 `min-height: 0;` (若是水平滾動則加 `min-width: 0;`)。
```css
/* 修改前的 CSS：會因為內容過長而撐破父層 600px 限制 */
.skills-container {
  flex: 1;
  overflow-y: auto;
}

/* 修改後的 CSS：乖乖限制在父層內，多出的部分產生滾動條 */
.skills-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 關鍵！告訴瀏覽器最小高度可以是 0 */
}
```

---

## [2026-05-29] 專案全面 RWD 響應式佈局升級與高度控制優化

### 🎯 實作重點
1. **行動版全螢幕選單 (Mobile Navigation)**
   - 於 `AppHeader.vue` 實作手機版漢堡選單，點擊 Menu 後展開全螢幕覆蓋 (Full-screen Overlay) 樣式，並為後續加入過渡動畫打底。
   - 修正點擊連結後自動關閉選單的 UX 細節 (`@click="isMenuOpen = false"`)。

2. **響應式網格與堆疊 (Grid & Stacking)**
   - **`HeroSection.vue`**: 在平板/手機版將 `4fr 6fr` 網格改為 `1fr` 垂直堆疊，並將行動操作按鈕改為 `flex-wrap`，動態縮小標題字級。
   - **`ProjectCardDetail.vue`**: 手機版取消左右分割，改為單欄佈局，並適度縮減內部 padding。
   
3. **卡片高度均分與溢出控制 (Flexbox Sizing)**
   - **`SkillSection.vue` & `WorksSection.vue`**:
     - 在右側的 `.side-cards` 及其內部卡片加入均分機制：`.side-cards > div { flex: 1 1 0; min-height: 0; overflow-y: auto; }`，確保系統動態、分數卡片能完美平分高度，不會被內容撐破版面。
     - 針對手機版 (`< 768px`)，將 `.side-cards` 轉為垂直排列。其中 `WorksSection` 在手機版特別設定 `.side-cards > div { flex: none; height: auto; }` 取消均分限制，改由內容自然撐開。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### 1. Flexbox 的均分魔法：`flex: 1 1 0` 與 `min-height: 0`
在做並排或上下堆疊的儀表板 (Dashboard) 介面時，我們常希望幾個卡片能「精準平分」剩餘空間。
- **`flex: 1 1 0`** (或縮寫 `flex: 1`)：代表該區塊可以伸展 (`flex-grow: 1`)、可以壓縮 (`flex-shrink: 1`)，並且初始基礎大小為 `0` (`flex-basis: 0`)。這是均分空間的核心。
- **陷阱：`min-height: auto`**：在 Flexbox 規範中，元素的 `min-height` 預設不是 0，而是 `auto` (即內容的高度)。如果卡片裡面的文字很長，卡片就會被強迫撐開，破壞了原本設定的 `flex: 1` 均分。
- **解法**：手動加上 `min-height: 0;` 打破這個預設限制，並配合 `overflow-y: auto;`，就能讓卡片維持均分的高度，內容過多時在內部產生捲軸。
```css
.side-cards > div {
  flex: 1 1 0;      /* 關鍵：強迫平分剩餘空間 */
  min-height: 0;    /* 關鍵：打破內容高度撐破版面的預設限制 */
  overflow-y: auto; /* 內容超出卡片範圍時產生捲軸 */
}
```

#### 2. 全螢幕覆蓋選單 (Full-screen Overlay Menu)
為了在手機版提供良好的操作體驗並為將來的動畫做準備，我們使用了 `position: fixed` 蓋滿畫面。
- **`pointer-events` 控制**：在選單未展開前 (`opacity: 0`)，必須加上 `pointer-events: none;`，否則透明的選單仍會像一塊玻璃阻擋底層畫面的點擊。展開時再恢復為 `pointer-events: auto;`。
- **層級控制 (`z-index`)**：覆蓋層 `z-index` 設為 1000，而 Logo 與 Menu 按鈕必須大於 1000 (設為 1001)，才能在展開選單時，按鈕依然可以被點擊用來關閉選單。
```css
.nav-links {
  position: fixed;
  inset: 0; /* 等同 top: 0; left: 0; right: 0; bottom: 0; */
  z-index: 1000;
  opacity: 0;
  pointer-events: none; /* 未展開時不干擾背後的點擊 */
  transition: opacity 0.3s ease;
}
.nav-links.is-open {
  opacity: 1;
  pointer-events: auto; /* 展開時恢復互動 */
}
```

---

## [2026-05-29] 專案詳細頁 (ProjectCardDetail) 新增收藏愛心功能與資料持久化

### 🎯 實作重點
1. **加入收藏按鈕與愛心切換 (UI/UX)**
   - 於 `ProjectCardDetail.vue` 的專案標題 (`h1`) 旁新增了愛心按鈕，並利用 Flexbox 的 `justify-content: space-between` 讓兩者水平對齊。
   - 加入了點擊按鈕時的微縮放動畫 (`transform: scale`) 提供即時的物理按壓回饋。
   - 利用 Vue 的動態 class 切換空心 (`♡`) 與實心紅色 (`♥`) 狀態。

2. **資料狀態持久化 (Data Persistence)**
   - 使用瀏覽器的 `localStorage` 來記錄使用者按過讚的專案 ID。
   - 利用 Vue 的 `onMounted` 鉤子在畫面載入時讀取過往紀錄，確保重新整理頁面後，按讚狀態不會消失。
   - 點擊按讚時，即時更新 Vue 的響應式狀態 (`ref`) 並將新資料序列化 (`JSON.stringify`) 後存入 `localStorage`。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### 1. Vue 響應式狀態與 LocalStorage 的結合
前端框架 (如 Vue/React) 的狀態存放在記憶體中，只要重整畫面 (F5) 就會被清空。為了讓狀態能跨越頁面重載，我們必須使用 Web API 中的 `localStorage`。
- **讀取 (`getItem`)**：因為讀取 `localStorage` 是一種非同步/副作用操作，通常會放在組件生命週期的 `onMounted` 階段執行。
- **型別轉換 (`JSON.parse` / `stringify`)**：`localStorage` **只能存取字串 (String)**。如果我們要存一個物件 (如 `{ "nexus-analytics": true }`)，存入前必須用 `JSON.stringify` 轉成字串，讀出時再用 `JSON.parse` 轉回物件。
```javascript
// 宣告響應式變數
const likedProjects = ref({})

// 畫面掛載時：從 LocalStorage 讀取字串，解析回物件
onMounted(() => {
  const saved = localStorage.getItem('portfolio_likes')
  if (saved) {
    likedProjects.value = JSON.parse(saved)
  }
})

// 點擊事件：更新變數，並轉成字串存回 LocalStorage
const toggleLike = () => {
  if (likedProjects.value[projectId]) {
    delete likedProjects.value[projectId] // 取消收藏
  } else {
    likedProjects.value[projectId] = true // 加入收藏
  }
  localStorage.setItem('portfolio_likes', JSON.stringify(likedProjects.value))
}
```

#### 2. CSS 物理按壓回饋 (`:active` 偽類)
在還沒加入複雜的飛出動畫前，我們能用最簡單的 CSS 讓按鈕具有「被按壓」的真實感。
- **`:hover` (懸停)**：滑鼠放上去時微放大 (`scale(1.1)`)，暗示此元素可互動。
- **`:active` (按壓)**：滑鼠點下且尚未放開的瞬間，微縮小 (`scale(0.9)`)，模擬真實世界按鈕被壓下去的物理反饋。
- **`transition`**：配合 `cubic-bezier` 貝茲曲線，可以讓放大縮小帶有「Ｑ彈」的果凍感。
```css
.like-btn {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.like-btn:hover {
  transform: scale(1.1); /* 滑鼠碰到時放大 10% */
}
.like-btn:active {
  transform: scale(0.9); /* 按下去的瞬間縮小 10% */
}
```

---

## [2026-05-29] 專案列表 (WorksSection) 實作輪播切換與 UX 優化

### 🎯 實作重點
1. **動態渲染圓點與點擊切換**
   - 移除原本寫死的 `<span class="dot">`，改用 `v-for="(project, index) in projects"` 動態渲染出與專案數量對應的輪播圓點。
   - 綁定 `@click="activeProjectIndex = index"`，當點擊圓點時，透過 Vue 的響應式資料更新機制，自動連動替換左側顯示的專案內容（標題、標籤等）。
   - 透過 `:class="{ active: activeProjectIndex === index }"` 動態切換當前選中的圓點樣式。

2. **擴大點擊範圍 (UX 優化)**
   - 將圓點大小提升至 `12x12px` 以增強視覺可視度。
   - 利用 CSS 偽元素 (`::before`) 在圓點周圍向外延伸 `10px` 的隱形區域，顯著提升了滑鼠或手機的點擊成功率 (Touch Target)，而不會影響原本的視覺佈局。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### 1. 資料驅動視圖 (Data-driven View) 與 `v-for`
傳統網頁開發中，如果要切換輪播圖，我們可能需要手動操作 DOM (例如 `document.getElementById`) 來隱藏與顯示對應的內容。而在 Vue 中，我們採用「資料驅動視圖」的概念：
- 畫面上有幾個圓點，是由 `projects` 的陣列長度決定。
- 畫面上顯示哪個專案，是由 `activeProjectIndex` 這個資料狀態決定。
只要資料一改變，畫面就會自動更新，開發者不需要去手動隱藏/顯示任何 DOM。
```html
<!-- 只要陣列有變動，圓點數量會自動增減 -->
<span 
  v-for="(project, index) in projects" 
  class="dot"
  :class="{ active: activeProjectIndex === index }"
  @click="activeProjectIndex = index"
></span>
```

#### 2. CSS 擴大點擊範圍 (Touch Target Expansion)
為了維持設計上的精緻感，按鈕或圓點有時會設計得很小。但這在手機操作或滑鼠點擊時會非常痛苦。我們可以使用「偽元素」來建立一層隱形的觸控區域。
- `position: relative`：讓原來的圓點作為定位基準。
- `::before` 配合 `position: absolute`：產生一個依附在圓點上的新圖層。
- 負值的 `top/bottom/left/right`：讓這個圖層向外擴張，形成一個更大的透明可點擊區域。
```css
.dot {
  position: relative; /* 成為偽元素的定位基準 */
  width: 12px; height: 12px;
}
/* 利用偽元素產生隱形的點擊護城河 */
.dot::before {
  content: ''; /* 必須要有 content 才會生成偽元素 */
  position: absolute;
  top: -10px; right: -10px; bottom: -10px; left: -10px; /* 四周向外擴張 10px */
  /* 因為沒有設定背景色，所以它是透明的，但依舊可以完美接收點擊事件！ */
}
```

---

## [2026-05-29] 技能分區 (SkillSection) 資料結構升級與輪播切換實作

### 🎯 實作重點
1. **升級多層級資料結構 (Mock Data)**
   - 將原本單一的 `skills` 陣列升級為包含多分類的 `skillCategories` 陣列。
   - 每筆資料除了原本的技能陣列外，新增了分類資訊（如 `Frontend Development`、`Backend & DevOps`），為未來的技能擴展打好基礎。
   
2. **切換分類與連動更新 (Reactivity)**
   - 實作了 `.pagination` 的動態點擊切換邏輯。
   - 為了避免切換分類後，右側的雷達與文字說明還殘留上一個分類的技能資訊，我們使用了 Vue 的 `watch` 監聽器。當使用者點擊圓點切換分類時，系統會自動選中該新分類的「第一項技能」，確保畫面資料的一致性。

3. **UX 體驗移植**
   - 成功將 `WorksSection` 的 12x12px 圓點與 `::before` 隱形點擊護城河 (Touch Target) 樣式無縫移植至此，確保跨元件的操作手感一致。

### 📚 基礎知識解說 (實作教學與範例程式碼)

#### 1. 複雜資料結構與 Computed 的搭配
當資料結構變得複雜（例如陣列中包著物件，物件中又包著陣列），直接在 Template 中寫邏輯會變得難以維護且容易出錯。這時我們可以善用 `computed` 抽出當下所需的「資料切片」。
```javascript
const skillCategories = ref([
  { title: 'Frontend', skills: [...] },
  { title: 'Backend', skills: [...] }
])

const activeCategoryIndex = ref(0)
// 利用 computed 自動鎖定當前的分類物件
const currentCategory = computed(() => skillCategories.value[activeCategoryIndex.value])
```
有了 `currentCategory` 後，在 Template 中就可以非常乾淨地寫成 `<div v-for="skill in currentCategory.skills">`，大幅提升程式碼的可讀性。

#### 2. `watch`：主動監聽狀態變化並執行連動行為
Vue 的核心是「狀態驅動畫面」，但有時候「狀態 A 的改變，必須連帶觸發狀態 B 的重置」，這時候就需要出動 `watch`。
以本專案為例，當 `activeCategoryIndex` (分類) 改變時，如果我們不處理 `activeSkill`，那右側詳細資訊版面依然會顯示上一個分類的技能。
```javascript
// 預設選擇當前分類的第一個技能
const activeSkill = ref(currentCategory.value.skills[0])

// 監聽 activeCategoryIndex，一旦它發生改變（例如使用者點擊切換輪播）
// 就強制把 activeSkill 重置為新分類中的第 0 個技能
watch(activeCategoryIndex, () => {
  activeSkill.value = currentCategory.value.skills[0]
})
```

---

## [2026-05-29] 專案架構大重構：Smart/Dumb Components 與全域狀態 (Composables)

### 🎯 實作重點
1. **落實 Smart/Dumb Component (容器與展示組件模式)**
   - **Smart Component (Views)**: 將 `AboutView`、`SkillsView` 與 `WorksView` 升級為負責「管理資料 (Mock Data) 與商業邏輯」的智慧容器。
   - **Dumb Component (Components)**: 將 `ProfileCard`、`SkillsSection`、`SkillCard` 與 `WorksSection` 降級為純粹負責「接收 Props 並展示畫面」以及「發送 Emits 向上層回報事件」的笨組件。這種模式大幅提升了組件的**可重用性 (Reusability)** 與**易測試性 (Testability)**。

2. **路由解耦 (Decoupling Router)**
   - 將 `ProjectCardDetail` 從獨立的頁面 (View) 降級為組件 (Component)。
   - 移除了內部的 `useRoute` 與 `useRouter` 依賴，改為透過 `Props` 接收 `projectId`，並透過 `emit('navigate-back')` 讓 `WorksView` 去決定實際的路由行為 (如 `router.push('/work')`)。

3. **全域狀態管理 (Vue Composables)**
   - 新增了 `src/composables/useLikes.js`。將原本寫死在詳細頁的 `localStorage` 愛心按讚邏輯抽離。
   - 讓 `WorksSection` (列表卡片) 與 `ProjectCardDetail` (詳細卡片) 都能共同引用這個 Composable，達成「一邊按讚，另一邊即時同步」的全域狀態連動。

### 📚 基礎知識解說 (架構與 API)

#### 1. Smart vs Dumb Component 模式
這是一種在 React/Vue 中非常經典的設計模式：
- **Smart (Container)** 負責思考：打 API、管理 `ref` 狀態、操作 Router。
- **Dumb (Presentational)** 負責長相：只接受 `props` 畫出 UI，當按鈕被點擊時，只負責呼叫 `$emit('xxx')` 把球踢回給 Smart。
```vue
<!-- Smart Component (WorksView.vue) -->
<template>
  <!-- 負責提供 projects 資料，並決定 toggleLike 該怎麼做 -->
  <WorksSection :projects="projects" @toggle-like="handleLike" />
</template>
```

#### 2. Vue Composables (組合式函數)
當多個組件需要「共用同一套邏輯與狀態」（例如按讚、購物車、會員登入狀態）時，我們可以寫一個 Composable：
```javascript
// useLikes.js
import { ref, watch } from 'vue'

// 宣告在 function 外面的 ref，會成為「模組層級」的全域單例 (Singleton)
const likedProjects = ref({}) 
let isInitialized = false

export function useLikes() {
  if (!isInitialized) {
    // 只在第一次呼叫時執行 localStorage 的讀取
    // 並設定 watch 來自動同步 localStorage
    isInitialized = true
  }

  const toggleLike = (id) => { /* 切換邏輯 */ }
  const isLiked = (id) => !!likedProjects.value[id]

  return { toggleLike, isLiked }
}
```
透過將 `likedProjects` 宣告在 `export function` **之外**，所有引入 `useLikes()` 的組件都會拿到「同一個記憶體位址的 ref」。這樣一來，不用依賴大型的 Pinia 狀態庫，也能輕鬆實作輕量級的全域狀態共用！

---

## [2026-05-29] AboutView 版面視覺重構與架構融合

### 🎯 實作重點
1. **重構視覺佈局 (Visual Revert)**
   - 將 `ProfileCard.vue` 的視覺設計退回至原先備受好評的 `HeroSection` 雙欄網格 (`4fr 6fr`) 佈局。
   - 左側使用佔據大面積的圖片區塊 (`aspect-ratio: 3/4`) 以提供極佳的視覺張力，取代原先的圓形小頭像。
   - 右側將姓名作為大標題 (Headline) 呈現，並將個人簡介 (`bio`) 以單欄大段落的方式排版，保持閱讀流暢度。

2. **繼承新版架構與資料流 (Architecture Integration)**
   - 儘管外觀回歸舊版，但**核心骨架依然保持 Smart/Dumb Component 的設計**。
   - `ProfileCard.vue` 內部不寫死任何資料，依舊透過 `Props` 接收來自 `AboutView.vue` (Smart Component) 所派發的假資料 (`name`, `title`, `bio`, `links`)。

3. **按鈕樣式移植與 RWD**
   - 將舊版中具有互動感與懸浮動畫的 `.btn.primary` (主按鈕) 與 `.btn.secondary` (次按鈕) 樣式完美移植給動態生成的社群連結。
   - 強化了響應式設計 (RWD)：在螢幕寬度小於 `992px` 與 `768px` 時，版面會自動流暢地折疊成上下瀑布流 (左圖上、右文下)，按鈕也會在手機版自適應填滿寬度。

### 📚 基礎知識解說 (CSS Grid 與 RWD)

#### CSS Grid 的強大排版能力
比起傳統的 `Flexbox`，`CSS Grid` 在處理「二維佈局」與「比例劃分」時更為直覺：
```css
.profile-hero {
  display: grid;
  /* 完美切分寬度為 4 份與 6 份 */
  grid-template-columns: 4fr 6fr;
  gap: 4rem;
  align-items: center;
}
```
配合 `@media` 查詢，只需要一行程式碼就能讓雙欄瞬間變成單欄：
```css
@media (max-width: 992px) {
  .profile-hero {
    grid-template-columns: 1fr; /* 切換為單欄佈局 */
  }
}
```
這種做法極大化地減少了為了適應行動裝置所需要撰寫的冗長 CSS，是現代前端最推薦的佈局手法。

---

## [2026-05-29] 全站佈局微調與手機版 (RWD) 視覺優化

在完成核心組件重構後，進行了針對全站留白與手機版顯示體驗的細節打磨：

### 🎯 實作重點
1. **全域與頁面留白瘦身 (Padding & Margin)**
   - `App.vue`: 縮減了外層容器的 `margin-top` 與內部卡片的 `gap`，讓全站內容更為緊湊。
   - `AboutView.vue` & `SkillsView.vue`: 移除了過多的上下 `padding`，並將 `AboutView` 的 `min-height` 改為 `auto`，解除高度限制帶來的排版僵硬感。

2. **核心卡片區塊優化 (Layout Stabilizing)**
   - `WorksSection.vue`: 在 `.works-layout` 明確加上 `width: 100%` 與 `min-height: 600px`，防止網頁在切換專案內容時發生高度跳動 (Layout Shift)，大幅提升了瀏覽體驗。

3. **行動裝置細節處理 (Mobile UI Refinement)**
   - **輪播控制點 (Pagination)**：針對手機版螢幕（`max-width: 768px`），在 `SkillsSection` 與 `WorksSection` 的 `.pagination` 皆新增了 `padding-bottom: 20px`，確保使用者在螢幕最下方點擊時有足夠的安全距離，避免誤觸或貼底。
   - **按鈕視覺比例**：在 `ProfileCard` 中，將手機版的外部連結按鈕寬度微調為 `85%`，使其在小螢幕上看起來更協調，不會顯得過於笨重。

---

## [2026-05-30] 🐛 Bug 修復：WorksSection 的 System Feed 硬編碼專案名稱

### 📁 異動檔案
- `src/views/WorksView.vue` — 每個 project 物件加入 `feeds` 陣列
- `src/components/WorksSection.vue` — 本地 `systemFeeds ref` 改為讀取 `activeProject.feeds` 的 `computed`；移除多餘的 `ref` import

### ❓ 為什麼需要修正？
`WorksSection.vue` 中有一個本地狀態 `systemFeeds`，最後一筆寫著：
```javascript
{ time: '11:30', text: 'Nexus Analytics v2.0 Deployed' }
```
當使用者切換到第二個專案 **Eco Tracker** 時，右側 System Feed 仍然顯示 "Nexus Analytics"，出現資料與畫面不一致的問題。

**根本原因**：資料寫死在 Dumb Component（`WorksSection`）的本地狀態，無法跟隨使用者選擇的專案動態更新。這違反了 Smart/Dumb Component 的架構原則，資料應由 Smart Component（`WorksView`）管理。

### 🎯 修正方式

**1. 將 `feeds` 移到 `WorksView.vue` 的 project 資料中**（每個專案有各自的 feeds）：
```javascript
// WorksView.vue — 每個 project 加入 feeds 陣列
{
  id: 'nexus-analytics',
  // ...其他欄位
  feeds: [
    { time: '09:42', text: 'Syncing repository assets...' },
    { time: '11:30', text: 'Nexus Analytics v2.0 Deployed' }
  ]
},
{
  id: 'eco-tracker',
  // ...其他欄位
  feeds: [
    { time: '10:15', text: 'Carbon tracking module initialized' },
    { time: '11:45', text: 'Eco Tracker v1.0 Deployed' }
  ]
}
```

**2. `WorksSection.vue` 改用 `computed` 讀取當前專案的 feeds**：
```javascript
// 修改前：寫死的本地 ref
const systemFeeds = ref([
  { time: '11:30', text: 'Nexus Analytics v2.0 Deployed' } // ← 寫死
])

// 修改後：computed 自動跟隨 activeProject 變動
const systemFeeds = computed(() => activeProject.value.feeds)
```

### 📚 基礎知識：`ref` vs `computed` 的選擇時機

| | `ref` | `computed` |
|--|-------|-----------|
| **用途** | 儲存**可被改變**的狀態 | 從其他狀態**衍生**出的唯讀值 |
| **觸發更新** | 手動 `.value = newValue` | 依賴的響應式資料改變時自動重算 |
| **本例** | 適合儲存 `activeProjectIndex` | 適合「目前 project 的 feeds」 |

**判斷原則**：如果一個值可以從其他響應式資料「算出來」，就用 `computed`，不要用 `ref` 手動維護。`ref` 只在「無法從其他狀態衍生，需要獨立管理」時使用。

---

## [2026-05-30] ✨ 優化：手機版 WorksSection 操作區排版與高度緊湊化

### 📁 異動檔案
- `src/components/WorksSection.vue` — 三處 RWD 樣式調整

### ❓ 為什麼需要修正？
原本手機版將操作按鈕改為垂直排列（`flex-direction: column`）後，產生三個新問題：

| 問題 | 原因 |
|------|------|
| 按鈕各自只有內容寬度，視覺不整齊 | 垂直排列時 flex 子元素預設以內容決定寬度 |
| 整體卡片高度過高 | `min-height: 600px` 在手機版未被覆蓋，強制撐高 |
| 卡片內部空白過多 | `.project-info` 在手機版仍維持 `padding: var(--space-4)`（32px） |

### 🎯 修正方式

**1. 移除手機版的 `min-height` 強制高度**（`max-width: 1024px`）
```css
.works-layout {
  min-height: auto; /* 讓內容決定高度，不再強制 600px */
}
```

**2. 縮減 `.project-info` 的 padding**（`max-width: 768px`）
```css
.project-info {
  padding: var(--space-3); /* 24px，從桌機版的 32px 縮減 */
}
```

**3. 按鈕改回水平排列，使用 `flex: 1` 均分寬度**（`max-width: 768px`）
```css
.project-actions {
  flex-direction: row; /* 水平排列：[ 詳細介紹 ][ Demo ][ ❤ ] */
}
.project-actions .btn {
  width: 100%;         /* 最終採用：每個按鈕撐滿寬度 */
  text-align: center;
}
/* .btn-like 無 .btn class，不受 flex: 1 影響，維持緊湊尺寸 */
```

### 📚 基礎知識：`width: 100%` vs `flex: 1` 的差異

兩者都能讓元素「撐滿空間」，但行為不同：

| | `width: 100%` | `flex: 1` |
|--|--------------|-----------|
| **含義** | 明確設為父容器的 100% 寬度 | 「我要所有可用的剩餘空間」 |
| **多個元素並排** | 每個都是 100%，會溢出或換行 | 自動均分剩餘空間 |
| **適用情境** | 單一元素填滿整行 | 多個元素共同填滿一行 |
| **本例** | ❌ 三個按鈕各佔 100% 會爆版 | ✅ 詳細介紹與 Demo 均分，愛心保持原尺寸 |

`flex: 1` 是 `flex-grow: 1; flex-shrink: 1; flex-basis: 0` 的縮寫，代表「可伸縮，初始寬度為 0，讓所有同樣設定的兄弟元素均分剩餘空間」。

---



### 📁 異動檔案
- `src/components/WorksSection.vue` — `@media (max-width: 768px)` 內加入 `.project-actions .btn { width: 100% }`

### ❓ 為什麼需要修正？
手機版（`max-width: 768px`）中，`.project-actions` 已正確改為 `flex-direction: column` 讓按鈕垂直排列，但沒有設定按鈕寬度。Flex 子元素在垂直排列時，預設寬度由**內容決定**（`align-items: stretch` 除外），導致「詳細介紹」與「Demo」按鈕在手機上只有文字那麼寬，視覺比例失衡。

### 🎯 修正方式
在手機版 media query 中，對有 `.btn` class 的按鈕加上 `width: 100%`：
```css
@media (max-width: 768px) {
  .project-actions .btn {
    width: 100%;
    justify-content: center; /* 文字與圖示維持水平置中 */
  }
}
```

選擇器使用 `.project-actions .btn` 而非直接 `.btn`，確保只影響操作區的按鈕。愛心按鈕（`.btn-like`）沒有 `.btn` class，因此不受影響，保持緊湊的圓形尺寸。

### 📚 基礎知識：Flexbox 子元素的預設尺寸行為

Flexbox 的主軸（main axis）與交叉軸（cross axis）在不同方向時，子元素的預設尺寸行為不同：

**水平排列（`flex-direction: row`，預設）**
- 主軸（水平）：子元素寬度由**內容決定**
- 交叉軸（垂直）：子元素高度預設**撐滿容器高度**（`align-items: stretch`）

**垂直排列（`flex-direction: column`）**
- 主軸（垂直）：子元素高度由**內容決定**
- 交叉軸（水平）：子元素寬度預設**撐滿容器寬度**（`align-items: stretch`）

根據這個規則，改為垂直排列後，按鈕**應該**會自動撐滿寬度。但本例中 `.project-actions` 沒有明確設定寬度，加上父層 `.project-info` 是 `display: flex; flex-direction: column`，實際計算出來的容器寬度可能不如預期。因此明確加上 `width: 100%` 是更可靠的做法，消除任何佈局上的不確定性。

---

## [2026-05-30] ✨ 優化：Scroll Hint 滾動後自動淡出

### 📁 異動檔案
- `src/components/SkillsSection.vue` — 加入 `@scroll` 監聽與 `is-hidden` class 控制
- `src/components/ProjectCardDetail.vue` — 加入 `window` scroll 監聽與 `is-hidden` class 控制

### ❓ 為什麼需要優化？
Scroll Hint 的目的是「提示使用者可以往下滑動」。但原本的設計在使用者開始滾動後仍持續顯示，使一個已完成任務的 UI 元素變成視覺干擾，尤其動畫效果會持續吸引注意力。

### 🎯 實作方式

**SkillsSection.vue**（捲動目標為元件內的 `div`）
```javascript
const isScrolled = ref(false)
const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 0
}
```
```html
<div class="skills-container" @scroll="handleScroll">
<div class="scroll-hint" :class="{ 'is-hidden': isScrolled }">
```

**ProjectCardDetail.vue**（捲動目標為 `window`）
```javascript
const isPageScrolled = ref(false)
const handlePageScroll = () => { isPageScrolled.value = window.scrollY > 0 }

onMounted(() => window.addEventListener('scroll', handlePageScroll))
onUnmounted(() => window.removeEventListener('scroll', handlePageScroll))
```
```html
<div class="scroll-hint-fixed" :class="{ 'is-hidden': isPageScrolled }">
```

兩個元件的 CSS 相同：
```css
.scroll-hint /* 或 .scroll-hint-fixed */ {
  transition: opacity 0.3s ease;
}
.scroll-hint.is-hidden {
  opacity: 0;
}
```

### 📚 基礎知識：兩種滾動監聽方式的差異

| | `@scroll` 事件（元件 div）| `window.addEventListener('scroll')`  |
|--|--------------------------|--------------------------------------|
| **適用情境** | 有 `overflow-y: auto` 的**元素內部**捲動 | 整個**頁面**捲動 |
| **Vue 寫法** | 直接在 template 用 `@scroll` 綁定 | 需在 `onMounted` 手動掛載 |
| **移除監聽** | Vue 會自動清理 | **必須**在 `onUnmounted` 手動移除，否則元件銷毀後監聽仍存在，造成 memory leak |

**為什麼 `window` 的監聽器必須手動移除？**
Vue 管理元件的生命週期，但 `window` 是全域物件，不屬於任何元件。當 `ProjectCardDetail` 被銷毀（使用者返回列表頁），元件的 DOM 消失了，但掛在 `window` 上的事件監聽器仍然活著，每次頁面滾動仍會執行 `handlePageScroll` 並試圖更新一個已不存在的響應式狀態，導致記憶體洩漏（Memory Leak）。因此必須在 `onUnmounted` 中呼叫 `removeEventListener`。

---

## [2026-05-30] 🔧 重構：Minor 程式碼品質修復（#8a–#8e）

### 📁 異動檔案
- `src/components/NavBar.vue` — 移除重複的 inline `z-index`
- `src/views/AboutView.vue` — 移除多餘水平 padding，修正誤導性註解
- `src/views/SkillsView.vue` — 移除多餘的 `padding: 0rem 0rem`
- `src/components/SkillsSection.vue` — 修正 `@media (max-width: 768px)` 縮排錯誤
- `updateDetail.md` — 修正舊教學範例中錯誤的 `import { defineEmits }` 寫法

### 🎯 各項修正說明

**#8a — NavBar.vue：重複的 `z-index: 1001`**
`<button>` 同時有 `style="z-index: 1001"` 與 scoped CSS `.menu-btn { z-index: 1001 }`，兩者完全相同。移除 inline style，由 CSS 單一管理。

**#8b — AboutView.vue：多餘水平 padding**
`.about-page` 設了 `padding: 0 var(--space-4)`（32px），但 `app-container` 已有 `padding: 0 var(--space-8)`（64px），造成 About 頁面比其他頁面額外窄 32px。另外 `min-height: auto` 的舊註解「扣除 NavBar 高度」語意不正確（該屬性只是移除高度限制），一併修正。

**#8c — SkillsView.vue：`padding: 0rem 0rem` 冗餘寫法**
`0rem` 與 `0` 完全等效，`rem` 單位在值為 `0` 時無意義，移除即可。

**#8d — SkillsSection.vue：縮排錯誤**
`@media (max-width: 768px)` 內的 `.side-cards > div {}` 屬性縮排未對齊選擇器層級，且 `flex: 1 ;` 後有多餘空格，統一修正為標準縮排。

**#8e — updateDetail.md：舊教學範例錯誤**
早期記錄中的程式碼範例含有 `import { defineEmits } from 'vue'`。`defineEmits` 是 Vue 3 編譯器巨集，不能被 import，已加上警告說明。

### 📚 基礎知識：CSS 樣式的優先順序（Specificity）

**為什麼 inline style 優先於 scoped CSS？**
CSS 的優先順序（Specificity）計算規則：
```
inline style  >  #id  >  .class  >  element
    1000      >   100  >    10   >      1
```
Inline style（寫在 HTML 標籤上的 `style="..."`）的優先權最高，因此即使 scoped CSS 已設定相同值，實際生效的永遠是 inline style。這導致未來若想用 CSS 覆蓋該屬性（例如在某個狀態下改變 z-index），inline style 會阻止覆蓋。

**最佳實踐**：除了動態計算（例如 `:style="{ width: computedWidth }"` 這類綁定），避免在 template 中寫靜態 inline style，統一在 CSS 中管理。

---

## [2026-05-30] 🐛 Bug 修復：WorksSection Demo 按鈕（`<a>` 標籤）可能出現底線

### 📁 異動檔案
- `src/components/WorksSection.vue` — `.btn` 加上 `text-decoration: none`

### ❓ 為什麼需要修正？
Demo 按鈕使用的是 `<a>` 標籤而非 `<button>`，這在語意上是正確的（因為它會導覽到外部連結）。但 `<a>` 標籤在瀏覽器的**預設樣式（User Agent Stylesheet）** 中帶有 `text-decoration: underline`，若沒有明確覆蓋，可能在部分瀏覽器或 CSS reset 環境下顯示底線，破壞按鈕外觀。

同樣的 `.btn` class 套用在 `<button>` 元素上時沒有問題（因為 `<button>` 預設沒有底線），但套在 `<a>` 上就需要明確處理。

### 🎯 修正方式
```css
/* [Fix #6] 加入 text-decoration: none，確保 <a> 標籤樣式一致 */
.btn {
  text-decoration: none;
}
```

### 📚 基礎知識：`<a>` vs `<button>` 的預設樣式差異

瀏覽器對不同 HTML 元素有不同的預設樣式，這些樣式稱為 **User Agent Stylesheet**：

| 元素 | 預設 `text-decoration` | 預設 `cursor` | 預設 `display` |
|------|----------------------|--------------|--------------|
| `<a>` | `underline` | `pointer` | `inline` |
| `<button>` | `none` | `default`（需手動設 `pointer`） | `inline-block` |

當你用 CSS 把 `<a>` 設計成按鈕外觀時，需要一併重設它的預設連結樣式；反過來，把 `<button>` 設計成連結外觀時，也需要重設它的邊框與背景。這就是為什麼在一個跨元素共用的 `.btn` class 中，明確宣告 `text-decoration: none` 是防禦性撰寫的好習慣。

---

## [2026-05-30] 🐛 Bug 修復：誤刪 `ref` import 導致 WorksSection 畫面崩潰

### 📁 異動檔案
- `src/components/WorksSection.vue` — 補回被錯誤移除的 `ref` import

### ❓ 為什麼需要修正？
在 Fix #5 中，將 `systemFeeds` 從 `ref` 改為 `computed` 後，判斷 `ref` 已無用途而一併從 import 移除。但 `activeProjectIndex = ref(0)` 仍在使用 `ref`，導致瀏覽器出現以下錯誤：

```
WorksSection.vue:14 Uncaught (in promise) ReferenceError: ref is not defined
runtime-core.esm-bundler.js:537 Uncaught (in promise) TypeError: Cannot read properties of null (reading 'flags')
```

第二個錯誤是連鎖反應：`ref` 未定義 → `setup()` 執行失敗 → Vue runtime 試圖渲染一個未正確初始化的元件 → 讀取 `null` 的屬性而崩潰。

### 🎯 修正方式
```javascript
// 修改前（錯誤）
import { computed } from 'vue'

// 修改後（正確）
import { ref, computed } from 'vue'
```

### 📚 基礎知識：`defineProps` / `defineEmits` 需要 import 嗎？

Vue 3 `<script setup>` 中有兩類 API，容易混淆：

| 類型 | 範例 | 需要 import？ | 原因 |
|------|------|-------------|------|
| **一般組合式 API** | `ref`, `computed`, `watch`, `onMounted` | ✅ 需要 | 這些是 Vue 的 runtime 函式，需明確引用 |
| **編譯器巨集 (Compiler Macros)** | `defineProps`, `defineEmits`, `defineExpose` | ❌ 不需要 | 這些由 Vue 編譯器在**打包階段**自動處理，不是 runtime 函式，也無法被 import |

```javascript
// ✅ 正確寫法
import { ref, computed } from 'vue'  // 一般 API 需要 import

const props = defineProps({ ... })   // 編譯器巨集，直接使用
const emit  = defineEmits([...])     // 編譯器巨集，直接使用
```

---

## [2026-05-30] 🐛 Bug 修復：WorksSection 萬用選擇器 `*` 過度隱藏滾動條

### 📁 異動檔案
- `src/components/WorksSection.vue` — 移除 `* {}` 萬用選擇器，改為只對 `.feed-list` 精確套用

### ❓ 為什麼需要修正？
```css
/* 修改前：影響 WorksSection 內部所有元素 */
* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```
雖然 Vue 的 `scoped` 會限制樣式只作用在當前元件內，但 `*` 仍會匹配該元件樹內的**每一個元素**。這帶來兩個問題：

1. **可維護性差**：若未來在 `WorksSection` 內新增一個需要顯示滾動條的區塊（例如 code block），會無聲無息地被隱藏，難以察覺
2. **意圖不清晰**：程式碼無法表達「哪些元素應該隱藏滾動條」，只有 `.feed-list` 實際上有 `overflow-y: auto` 且需要隱藏

### 🎯 修正方式
移除 `*` 區塊，將三個滾動條隱藏屬性合併進 `.feed-list` 的規則中：
```css
/* 修改後：精確作用於需要的元素 */
.feed-list {
  overflow-y: auto;
  max-height: 150px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;    /* Firefox */
}
.feed-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
```

### 📚 基礎知識：CSS 選擇器的精確性原則

在撰寫 CSS 時，選擇器應盡量**精確描述意圖**，常見的三種粒度：

| 選擇器 | 作用範圍 | 適用情境 |
|--------|---------|---------|
| `*` | 所有元素 | 僅用於全域 reset（如 `box-sizing`），幾乎不應在元件層級使用 |
| `.container *` | 某容器內所有元素 | 仍然太廣，應避免 |
| `.feed-list` | 精確的單一元素 | ✅ 推薦：意圖清晰，不影響無關元素 |

**Vue Scoped 的限制**：`scoped` 只能確保樣式不**洩漏到其他元件**，但無法阻止你在元件內部寫出影響過廣的選擇器。元件內部的 CSS 精確度仍需開發者自行把關。

---

## [2026-05-30] 🐛 Bug 修復：ProjectCardDetail 所有資料寫死，無法動態顯示專案內容

### 📁 異動檔案
- `src/views/WorksView.vue` — 擴充 `projects` 資料結構；改傳 `project` 物件給子元件；加入無效 ID 的防禦判斷
- `src/components/ProjectCardDetail.vue` — prop 從 `projectId: String` 改為 `project: Object`；所有 hardcoded 文字改為動態綁定；移除 `text-transform: capitalize` 暫時寫法

### ❓ 為什麼需要修正？
`ProjectCardDetail.vue` 原本只透過 `projectId` prop 接收一個字串 ID，但元件內部卻沒有任何機制根據這個 ID 取得真實資料，導致：

| 問題 | 原始碼位置 | 說明 |
|------|-----------|------|
| 標題顯示 ID 字串 | `<h1>Project: {{ props.projectId }}</h1>` | 顯示 "Project: nexus-analytics" 而非真實標題 |
| Tags 寫死 | `<span class="tag">FinTech</span>` | 切換到 eco-tracker 仍顯示 FinTech |
| 說明文字寫死 | Overview / Architecture 段落 | 兩個專案共用同一段文字 |
| 連結寫死 | `href="https://example.com"` | 所有專案都指向同一個假連結 |
| 側欄資訊寫死 | Role / Timeline | 所有專案顯示相同的職位與時程 |

**根本原因**：資料（`projects` 陣列）存在 `WorksView.vue`，但沒有將對應的 `project` 物件往下傳，子元件拿不到任何資料可用。

### 🎯 修正方式

**1. 擴充 `WorksView.vue` 的資料結構**，加入詳細頁所需的欄位：
```javascript
// 修改前：只有列表用到的欄位
{ id, title, tags, demoUrl }

// 修改後：加入詳細頁需要的欄位
{ id, title, tags, demoUrl, githubUrl, role, timeline, overview, architecture }
```

**2. 用 `find()` 查找當前 project，改傳整個物件**（而非只傳 ID 字串）：
```javascript
// 修改前：只傳 ID
const currentProjectId = computed(() => route.params.id)
// <ProjectCardDetail :projectId="currentProjectId" />

// 修改後：根據 ID 找到完整物件再傳入
const currentProject = computed(() =>
  projects.value.find(p => p.id === route.params.id) || null
)
// <ProjectCardDetail :project="currentProject" />
```

**3. 加入無效 ID 的防禦判斷**：
```javascript
// 修改前：只要有 ID 就顯示詳細頁
const isDetailView = computed(() => !!currentProjectId.value)
// 問題：瀏覽器直接輸入 /work/不存在的ID 會顯示空白頁

// 修改後：找得到對應 project 才顯示詳細頁，否則 fallback 回列表
const isDetailView = computed(() => !!currentProject.value)
```

### 📚 基礎知識：Props 設計 — 傳 ID vs 傳物件

這是 Vue / React 元件設計中很常見的抉擇：

**傳 ID（讓子元件自己查詢）**
```vue
<!-- 父元件只給 ID，子元件自己去 store / API 拿資料 -->
<ProjectDetail :project-id="'nexus-analytics'" />
```
適用時機：子元件可以存取全域狀態（如 Pinia store），或需要對 API 發請求時。

**傳物件（父元件負責查詢，子元件只管顯示）**
```vue
<!-- 父元件查好資料，直接傳完整物件 -->
<ProjectDetail :project="currentProject" />
```
適用時機：資料已在父元件或同層級元件中。符合本專案的 Smart/Dumb Component 架構 — **父元件（Smart）負責取資料，子元件（Dumb）負責顯示**。

本次選擇「傳物件」，原因：
- 資料就在 `WorksView.vue`（Smart Component）裡，不需要子元件另外查詢
- 讓 `ProjectCardDetail` 保持純粹的展示元件，不依賴任何資料來源，可重用性更高
- 測試更容易：只需傳入一個假物件就能獨立測試元件的顯示邏輯

---

## [2026-05-30] 🐛 Bug 修復：`target="_blank"` 缺少安全屬性 (Tab-napping)

### 📁 異動檔案
- `src/components/ProfileCard.vue` — 社群連結 `<a>` 加上 `rel`
- `src/components/WorksSection.vue` — Demo 按鈕 `<a>` 加上 `rel`
- `src/components/ProjectCardDetail.vue` — Live Demo / GitHub 連結 `<a>` 加上 `rel`

### ❓ 為什麼需要修正？
所有使用 `target="_blank"` 開啟新分頁的 `<a>` 標籤，都缺少 `rel="noopener noreferrer"` 屬性。這是一個已被廣泛記錄的**前端安全漏洞**，稱為 **Tab-napping（分頁挾持）**。

攻擊流程如下：
1. 使用者點擊你的連結，瀏覽器在新分頁開啟目標網站
2. 目標網站（或已被入侵的網站）可透過 `window.opener` 取得對**原本分頁**的參考
3. 惡意腳本執行 `window.opener.location = 'https://phishing-site.com'`，悄悄將原分頁導向釣魚頁面
4. 使用者切回原分頁時，看到的已是假的登入畫面

### 🎯 修正方式
在所有 `target="_blank"` 的 `<a>` 標籤加上 `rel="noopener noreferrer"`：
```html
<!-- 修改前（有安全疑慮） -->
<a href="..." target="_blank">Link</a>

<!-- 修改後（安全） -->
<a href="..." target="_blank" rel="noopener noreferrer">Link</a>
```

### 📚 基礎知識：`rel` 屬性的兩個值各自的作用

| 值 | 作用 |
|----|------|
| `noopener` | 讓新分頁**無法存取** `window.opener`，直接切斷與原分頁的 JS 連結，防止 Tab-napping |
| `noreferrer` | 讓瀏覽器不在 HTTP `Referer` 標頭中傳遞來源網址，保護使用者隱私（同時隱含 `noopener` 的效果） |

**為什麼兩個都要寫？** `noreferrer` 在較舊的瀏覽器中並不隱含 `noopener`，同時撰寫可確保跨瀏覽器的完整防護。

> **補充**：現代瀏覽器（Chrome 88+）已將 `target="_blank"` 的預設行為改為隱含 `noopener`，但明確撰寫屬性仍是最佳實踐，可確保舊版瀏覽器與程式碼意圖的一致性。

---

## [2026-05-30] 🐛 Bug 修復：style.css Vite 樣板 CSS 全域污染

### 📁 異動檔案
- `src/style.css` — 清除所有 Vite 樣板殘留樣式，只保留滾動條隱藏

### ❓ 為什麼需要修正？
Vite 在建立新專案時會自動產生 `style.css`，內容為示範用的預設樣式，**不屬於本專案設計系統的一部分**。由於 `main.js` 一直 `import './style.css'`，這些樣式一直默默生效，造成以下潛在問題：

| 問題 | 說明 |
|------|------|
| 全站文字被強制置中 | `#app { text-align: center }` 直接作用於 Vue 根節點 |
| 寬度限制衝突 | `#app { width: 1126px }` 與 `App.vue` 的 `.app-container { max-width: 1440px }` 相互競爭 |
| h1/h2 全域字型覆蓋 | `h1 { font-size: 56px; margin: 32px 0 }` 可能在某些情境覆蓋元件 scoped 樣式 |
| 意外的 Dark Mode | `@media (prefers-color-scheme: dark)` 使深色系統的訪客看到非預期的黑色介面 |
| CSS 變數命名混亂 | 定義了 `--text`, `--bg`, `--accent` 等與本專案不同命名的變數，未來若誤用難以追查 |

### 🎯 修正方式
將 `style.css` 清空，**只保留已記錄於本文件的滾動條隱藏功能**（該功能是刻意設計，用於防止 Windows 上滾動條出現時的版面跳動）：
```css
body {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;    /* Firefox */
}
body::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
```

### 📚 基礎知識：為什麼 CSS 的載入順序很重要？

當多個 CSS 規則作用在同一個元素時，瀏覽器會依照「**優先權 (Specificity)**」與「**載入順序 (Order)**」來決定哪個規則最終生效：

1. **優先權 (Specificity)**：`#id` > `.class` > `element`
   - `#app { text-align: center }` 的優先權比 `.app-container { ... }` 高，因此即使 `.app-container` 沒設 `text-align`，子元素也會繼承 `#app` 的置中效果
   
2. **後者覆蓋前者 (Cascade)**：若優先權相同，後面載入的 CSS 會覆蓋前面的
   - `style.css` 在 `main.js` 中最先被 import，代表它的規則是「基底層」，之後的 `App.vue` scoped styles 再疊加上去
   - 但 scoped styles 只能控制有 class 的元素，對 `#app` 或 `body` 等全域選擇器的影響是間接的

**最佳實踐**：全域 CSS 只放**真正需要全域生效**的規則（如 reset、scrollbar、字型 fallback），避免在全域 CSS 定義會影響特定元素佈局的樣式。

---

## [2026-05-29] 全站導入 8px Spacing 系統 (Design Tokens)

為了解決專案中充斥的「魔法數字 (Magic Numbers)」(如 `padding: 2rem; gap: 1.5rem`)，全面導入了現代化 UI 設計主流的 **8-Point Grid System (8px 網格系統)**。

### 🎯 實作重點
1. **建立全域 Design Tokens**
   在 `App.vue` 的 `:root` 中宣告了 `--space-*` 系列的 CSS 變數，建立了從 `4px` (`--space-0-5`) 到 `128px` (`--space-16`) 的標準化間距比例。
2. **消滅硬編碼 (Hard-coded) 的間距**
   將全站元件（`App.vue`, `NavBar.vue`, `ProfileCard.vue`, `SkillsSection.vue`, `WorksSection.vue`, `ProjectCardDetail.vue`）內的 `margin`, `padding`, `gap` 全數替換為 `--space-*` 變數。
3. **優雅的 RWD 斷點切換**
   在手機版 (`@media (max-width: 768px)`) 中，不依賴猜測，而是有系統地將大間距降級。例如將桌機版的 `gap: var(--space-8)` 統一在手機版切換為 `gap: var(--space-4)`，確保排版縮放的一致性。

### 📚 基礎知識解說 (8px 系統與 `rem` 的結合)

#### 為什麼要用 8px 為基準？
8 是 2 的三次方，這在處理螢幕解析度（通常也是偶數或 2 的倍數）時能確保完美的像素對齊 (Pixel-perfect)。使用 8px 系統能讓所有的留白、卡片大小、字體排版都呈現出一種和諧的節奏感，這也是 Figma 等設計軟體、Tailwind CSS、Material Design 所採用的工業標準。

#### 為什麼不直接用 `px` 而要用 `rem` 定義變數？
如果您直接寫死 `--space-2: 16px;`，會破壞網頁的 **無障礙存取 (Accessibility, a11y)** 功能。
當使用者因為視力需求，將瀏覽器預設字體從 16px 放大到 24px 時：
- `px`：間距永遠固定不變，導致字體變大但卡片擠在一起破版。
- `rem`：由於 `rem` 是相對於 Root Font Size，因此 `1rem` 會跟著自動變成 24px，所有的版面與間距都會按比例完美放大。

這就是為什麼我們**「概念上使用 8px 網格，但在 CSS 實作上依舊寫 `rem`」**：
```css
:root {
  /* 概念是 8px 系統，實作是 rem 單位 (以 1rem = 16px 為基準) */
  --space-1: 0.5rem;    /* 相當於 8px */
  --space-2: 1rem;      /* 相當於 16px */
  --space-3: 1.5rem;    /* 相當於 24px */
}
```
這種做法同時兼顧了「設計師的網格邏輯」與「前端的 RWD / 無障礙縮放原則」。
