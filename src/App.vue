<script setup>
import { gsap } from 'gsap'
import NavBar from './components/NavBar.vue'

// [GSAP Step G] 頁面切換動畫
// :css="false" 關閉 Vue CSS transition，完全交由 GSAP 控制
// mode="out-in" 舊頁完全離場後新頁才進場，避免兩頁同時存在

// [Fix] 移除 y 軸移動：Works 頁面 min-height 600px 超出 viewport
// y 移動會造成可見的版面位移（彈跳感），改為純 opacity 淡入淡出
// 方向性進場感由各元件的 x 軸動畫（標題滑入）負責
const onEnter = (el, done) => {
  gsap.from(el, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: done
  })
}

const onLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<template>
  <div class="app-container">
    <div class="viewport-glow" aria-hidden="true"></div>
    <NavBar />
    <main class="main-content">
      <!-- [GSAP Step G] :key="route.path" 讓 Vue 每次切換路由都視為新元件，確保動畫觸發 -->
      <router-view v-slot="{ Component, route }">
        <Transition :css="false" mode="out-in" @enter="onEnter" @leave="onLeave">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 全域 CSS 變數定義 */
:root {
   /* --bg-primary: #EBE4DB; */
  --bg-primary: #f5f4f4;
  --text-primary: #333333;
  --text-muted: #666666;
  --accent-color: #B53A26;
  --accent-hover: #9A301E;
  --card-bg: #FFFFFF;
  --surface-secondary: #f5f5f5;
  --tag-bg: #efefef;
  --tag-color: #555555;
  --border-color: #e0e0e0;
  --skill-logo-bg: #e9ecef;
  --scroll-hint-bg: rgba(255, 255, 255, 0.92);
  --placeholder-bg: #d5cfc6;
  --btn-dark-bg: #333333;
  --btn-dark-color: #ffffff;

  /* Shadow Elevation System — 暖棕調陰影，與 #EBE4DB 背景自然融合 */
  --shadow-sm: 0 2px 8px rgba(70, 50, 30, 0.07);
  --shadow-md: 0 4px 16px rgba(70, 50, 30, 0.10);
  --shadow-lg: 0 12px 32px rgba(70, 50, 30, 0.13);

  /* Viewport Inner Glow — 暖色邊框光暈，四邊向內漸層 */
  --glow-color-1: rgba(210, 111, 50, 0.24);
  --glow-color-2: rgba(181, 57, 38, 0.253);
  --glow-spread-1: 80px;
  --glow-spread-2: 180px;
  --glow-line-color: rgba(255, 200, 140, 0.55);
  --glow-line-bloom: rgba(240, 150, 80, 0.30);
  --glow-line-width: 2px;
  --glow-line-bloom-spread: 22px;

  /* 8px Spacing System (1rem = 16px) */
  --space-0-5: 0.25rem;  /* 4px */
  --space-1: 0.5rem;     /* 8px */
  --space-2: 1rem;       /* 16px */
  --space-3: 1.5rem;     /* 24px */
  --space-4: 2rem;       /* 32px */
  --space-5: 2.5rem;     /* 40px */
  --space-6: 3rem;       /* 48px */
  --space-8: 4rem;       /* 64px */
  --space-10: 5rem;      /* 80px */
  --space-12: 6rem;      /* 96px */
  --space-16: 8rem;      /* 128px */
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  /* [Font] Albert Sans 取代 Helvetica Neue，確保跨平台字體一致 */
  font-family: 'Albert Sans', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.viewport-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 900;
  box-shadow:
    inset 0 0 0 var(--glow-line-width) var(--glow-line-color),
    inset 0 0 var(--glow-line-bloom-spread) 0 var(--glow-line-bloom),
    inset 0 0 var(--glow-spread-1) var(--glow-color-1),
    inset 0 0 var(--glow-spread-2) var(--glow-color-2);
}

.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-8);
  min-height: 100dvh;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-4);
  /* [Layout] 全站底部統一留白，消除內容貼底的壓迫感 */
  padding-bottom: var(--space-8);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --card-bg: #252525;
    --surface-secondary: #2e2e2e;
    --text-primary: #e8e8e8;
    --text-muted: #909090;
    --tag-bg: #383838;
    --tag-color: #c0c0c0;
    --border-color: #444444;
    --skill-logo-bg: #3d3d3d;
    --scroll-hint-bg: rgba(35, 35, 35, 0.92);
    --placeholder-bg: #3a3736;
    --btn-dark-bg: #e8e8e8;
    --btn-dark-color: #1a1a1a;
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.6);
    --glow-color-1: rgba(80, 120, 200, 0.18);
    --glow-color-2: rgba(181, 57, 38, 0.15);
    --glow-line-color: rgba(120, 155, 230, 0.3);
    --glow-line-bloom: rgba(80, 120, 200, 0.15);
  }
}

@media (max-width: 768px) {
  :root {
    --glow-spread-1: 50px;
    --glow-spread-2: 130px;
  }
  .app-container {
    padding: 0 var(--space-3);
  }
  .main-content {
    gap: var(--space-8);
    margin-top: var(--space-4);
    padding-bottom: var(--space-6); /* 手機版留白稍小 */
  }
}
</style>
