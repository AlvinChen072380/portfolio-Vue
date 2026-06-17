# GSAP 動畫更新紀錄

## 已完成工作

### 1. ProfileCard — 標題 ScrambleText 動畫（2026-05-31）

**檔案：** `src/components/ProfileCard.vue`

#### 過程

1. **方案 A 試作（Lines mask reveal）**
   - 使用 `SplitText.create()` 搭配 `type: 'words', mask: 'words'`
   - 將 `.highlight`（`Alvin Chen`）拆成兩個 word 元素
   - 以 `gsap.from(split.words, { yPercent: 100, stagger: 0.1 })` 讓兩字從遮罩下方滑出
   - 在 `headlineRef` 拆出獨立的 `helloRef`（`Hello! I'm`）與 `highlightRef`（`Alvin Chen`），以便分別控制動畫

2. **切換至方案 D（ScrambleText）**
   - 移除 SplitText，改用 `ScrambleTextPlugin`
   - 以 `gsap.to(highlightRef, { scrambleText: { text, chars: 'upperCase', revealDelay: 0.3, speed: 0.4 } })` 做亂碼解密效果

#### 插件

```javascript
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
gsap.registerPlugin(ScrambleTextPlugin)
```

#### 最終動畫序列（ProfileCard timeline）

| 步驟 | 元素 | 動畫 |
|------|------|------|
| 1 | 頭像圖片 | `from { opacity: 0, x: -20 }` |
| 2 | `Developer` tag | `from { opacity: 0, y: 10 }` |
| 3 | `Hello! I'm` | `from { opacity: 0, x: -15 }` |
| 4 | `Alvin Chen` | ScrambleText 亂碼解密（大寫字元） |
| 5 | bio 段落 | `from { opacity: 0, y: 10 }` |
| 6 | 按鈕群 | `from { opacity: 0, y: 8, stagger }` |

---

### 2. WorksSection / SkillsSection — Pagination 切換過渡動畫（2026-06-02）

**檔案：** `src/components/WorksSection.vue`、`src/components/SkillsSection.vue`

#### 需求

點擊 pagination 圓點時，主卡片與右側 side-cards 同步淡出→資料切換→淡入，取代原本的瞬間切換。

#### 實作方式

以 `selectPage()` / `selectCategory()` 攔截點擊，由 GSAP 控制 opacity 動畫，動畫完成後才觸發 Vue 響應式更新。

```js
// 以 WorksSection 為例（SkillsSection 結構相同）
const sideCardsRef = ref(null);
let isAnimating = false;

const selectPage = (index) => {
  if (index === activeProjectIndex.value || isAnimating) return;
  isAnimating = true;
  const targets = [cardRef.value, sideCardsRef.value];
  gsap.to(targets, {
    opacity: 0, duration: 0.18, ease: "power2.in",
    onComplete: () => {
      activeProjectIndex.value = index;          // 資料切換
      gsap.to(targets, {
        opacity: 1, duration: 0.25, ease: "power2.out",
        onComplete: () => { isAnimating = false; },
      });
    },
  });
};
```

template 將 `@click="activeProjectIndex = index"` 替換為 `@click="selectPage(index)"`，並在對應 DOM 加上 `ref`。

#### 知識點

| 項目 | 說明 |
|------|------|
| 攔截點擊而非用 `watch` | `watch` 的時機在資料已變更後，無法在資料更新前做淡出；click handler 才能保證「先淡出、再改資料」的順序 |
| `isAnimating` 防連點 | 短時間連點會讓多個 tween 同時跑並競爭 opacity，`isAnimating` flag 確保前一輪動畫結束前忽略新點擊 |
| GSAP 陣列目標 | `gsap.to([ref1, ref2], {...})` 可同時對多個元素套用同一 tween，比分開呼叫兩次更簡潔 |
| Vue 響應式更新時機 | 在 `onComplete` 裡才改 `activeXxxIndex.value`，確保 DOM 在不可見狀態下更新，避免內容閃爍 |

---

### 3. NavBar — 漢堡選單橢圓光暈（2026-06-02）

**檔案：** `src/components/NavBar.vue`

#### 需求

在 mobile 漢堡選單 overlay 加入從中心向外拓散的橢圓形暖色光暈，效果上與既有的 `.viewport-glow`（矩形 inset box-shadow）相似但形狀與範圍不同。

#### 實作方式

```css
/* @media (max-width: 768px) 內 */
.nav-links::before {
  content: '';
  position: absolute;
  inset: 0;                       /* 填滿整個 overlay，讓漸層能延伸到畫面四角 */
  pointer-events: none;
  z-index: -1;
  background: radial-gradient(ellipse 65% 78% at center,
    rgba(210, 111, 50, 0.30) 0%,
    rgba(181, 57, 38, 0.15) 45%,
    rgba(245, 244, 244, 0) 100%   /* bg-primary 同色透明，避免灰色過渡帶 */
  );
}
```

#### 遇到的問題：橢圓邊緣無法延伸至畫面其餘區域

**症狀：** 橢圓光暈邊緣透明後，外側仍是純色背景，沒有漸層延伸感。

**原因：**
第一版使用 `width: 65%; height: 78%; border-radius: 50%` 把 `::before` 的元素本身裁成橢圓，元素邊界外就是無修飾的 `--bg-primary`，漸層無法穿透元素邊界繼續延伸。

**解法：**
移除尺寸限制，改用 `inset: 0` 讓元素填滿整個 overlay；橢圓形狀改由 `radial-gradient(ellipse 65% 78% ...)` 的漸層本身定義，不依賴元素裁切。

#### 知識點

| 項目 | 說明 |
|------|------|
| 橢圓形狀的兩種做法 | `border-radius: 50%` 裁切元素 vs. `radial-gradient(ellipse W H at center)` 由漸層定義，後者可讓漸層自然延伸超出「視覺橢圓」範圍 |
| 透明色的選擇 | CSS 的 `transparent` 等同 `rgba(0,0,0,0)`，從有色過渡至此會出現灰色帶（premultiplied alpha 問題）；應使用背景同色的透明版本，例如 `rgba(245,244,244,0)` |
| `inset: 0` | 等同 `top:0; right:0; bottom:0; left:0`，讓絕對定位元素完整填滿父容器 |

---

## 遇到的問題與解法

### 問題：FOUC（Flash of Original Content）

**症狀：** 重新整理頁面後，`Alvin Chen` 完整文字會先短暫顯示，隨後才開始 ScrambleText 動畫。

**原因：**
Vue 在 `onMounted` 前就已完成 DOM 渲染，`Alvin Chen` 早已畫在畫面上。
`gsap.to()` 動畫不像 `gsap.from()` 會自動設起始狀態——它從元素的「現有樣子」開始，
因此 ScrambleText 接管前有一幀空窗期會看到完整文字。

**解法：**

```javascript
gsapCtx = gsap.context(() => {
  // ① 立刻隱藏，在動畫接管前不讓文字顯示
  gsap.set(highlightRef.value, { autoAlpha: 0 })

  // ② ScrambleText 開始的瞬間才解除隱藏
  gsap.to(highlightRef.value, {
    scrambleText: { ... },
    onStart: () => gsap.set(highlightRef.value, { autoAlpha: 1 }),
  })
})
```

**為何用 `autoAlpha` 而非 `opacity`：**
`autoAlpha: 0` 同時設定 `opacity: 0` + `visibility: hidden`，
元素不顯示也不攔截滑鼠事件；只用 `opacity: 0` 則元素仍佔位且可被點擊。

**通用原則：**
- 使用 `gsap.from()` → GSAP 自動處理起始狀態，通常不需預先隱藏
- 使用 `gsap.to()` → 元素起始狀態是 DOM 原始樣子，需手動用 `gsap.set()` 預先隱藏

---

## 待實作

- [x] SkillsSection `Skills & Expertise` 標題加上 ScrambleText
- [x] WorksSection `My side-Projects` 標題加上 ScrambleText

---

## 附錄：Composable vs. 重複撰寫的選擇依據

### 直接在各元件重複撰寫（方案一，本次採用）

**做法：** 相同邏輯直接複製到每個需要的元件中。

```javascript
// SkillsSection.vue
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
gsap.registerPlugin(ScrambleTextPlugin)

gsap.set(titleRef.value, { autoAlpha: 0 })
gsap.to(titleRef.value, { scrambleText: { ... }, onStart: ... })

// WorksSection.vue — 結構完全相同，僅文字內容不同
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
gsap.registerPlugin(ScrambleTextPlugin)

gsap.set(titleRef.value, { autoAlpha: 0 })
gsap.to(titleRef.value, { scrambleText: { ... }, onStart: ... })
```

**適合情境：**
- 使用次數少（2～3 個元件）
- 各處的參數或行為有可能走向不同（日後可能分道揚鑣）
- 快速試驗效果，尚未確定是否要統一

**缺點：**
- 參數散落各處，想統一調整 `chars`、`speed` 等設定需逐一修改
- 重複的 import / registerPlugin 呼叫（雖然 GSAP 自動去重，仍是冗餘程式碼）

---

### 抽成 Composable（方案二，備選）

**做法：** 將邏輯封裝進 `composables/` 資料夾，元件只呼叫介面。

```javascript
// composables/useScrambleTitle.js
import { gsap } from "gsap"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
gsap.registerPlugin(ScrambleTextPlugin)

export function useScrambleTitle(titleRef) {
  function play() {
    gsap.set(titleRef.value, { autoAlpha: 0 })
    gsap.to(titleRef.value, {
      duration: 1.2,
      scrambleText: {
        text: titleRef.value.textContent.trim(),
        chars: "upperCase",
        revealDelay: 0.3,
        speed: 0.4,
      },
      ease: "none",
      onStart: () => gsap.set(titleRef.value, { autoAlpha: 1 }),
    })
  }
  return { play }
}

// 各元件只需：
import { useScrambleTitle } from "@/composables/useScrambleTitle"
const { play } = useScrambleTitle(titleRef)
onMounted(() => { play() })
```

**適合情境：**
- 三個以上元件共用同一套行為
- 參數需要統一管理（日後想一次調整所有標題的動畫速度）
- 邏輯本身有一定複雜度（例如還需處理 cleanup、響應式參數）

**缺點：**
- 多一層抽象，初次閱讀程式碼需要跳到 composable 才能理解全貌
- 過度抽象：若各處行為最終走向不同，反而需要再拆回去

---

### 決策速查

| 考量點 | 選直接重複 | 選 Composable |
|--------|-----------|--------------|
| 使用次數 | 1～2 處 | 3 處以上 |
| 參數是否會分歧 | 有可能 | 不會，需統一 |
| 邏輯複雜度 | 簡單（5 行內） | 有狀態、有 cleanup |
| 目前確定性 | 還在試驗 | 已確定方向 |

> **本次決策：** ScrambleText 目前在 3 個元件使用，但邏輯僅 6 行且處於試驗階段，先維持直接撰寫；若日後確認風格統一且擴展到更多元件，再抽成 composable。
