# 專案更新紀錄 (Update Details)

此文件用於彙整並記錄本專案的各次更新與迭代過程，後續的新增功能或微調都會統一記錄於此。

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
import { defineEmits } from 'vue'

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
