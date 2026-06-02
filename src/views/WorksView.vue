<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorksSection from '../components/WorksSection.vue'
import ProjectCardDetail from '../components/ProjectCardDetail.vue'

const route = useRoute()
const router = useRouter()

const projects = ref([
  {
    // [Fix] 圖片路徑修正：public/ 資料夾內容在 Vite 中從根目錄存取，不含 /public 前綴
    id: 'hi-refrigerator',
    image: '/images/works/Hi_refrigerator.webp',
    title: 'Hi refrigerator!',
    tags: ['AI Search', 'Web App', 'Recipe', 'React'],
    demoUrl: 'https://hi-refrigerator.vercel.app/',
    githubUrl: 'https://github.com/AlvinChen072380/hi-refrigerator',
    role: 'Frontend Developer',
    timeline: '1 Month (Q1 2026)',
    overview: '以 React 開發的手機端優先 (Mobile-First) 食譜搜尋網頁。為改善傳統關鍵字搜尋的限制，導入 Google Gemini API 解析自然語言，讓使用者能用日常口語尋找並過濾素食食譜。同時為確保資安，採用 Vercel Serverless 建立中介層來隱藏 API Key，並著重 UI/UX 細節，打造適合單手操作的流暢體驗。',
    architecture: '選用技術：React (Vite) / Google Gemini API / Vercel Serverless / TheMealDB API',
    feeds: [
      { time: '01/22', text: '初始化 React + Vite 架構環境' },
      { time: '01/25', text: '配置 GSAP 轉場與響應式斷點' },
      { time: '01/28', text: '串接 Gemini API 進行搜尋翻譯測試' },
      { time: '01/31', text: '自動化部署至 Vercel 生產環境成功' }
    ],
    // [Part2] Lighthouse Performance 分數
    performance: { score: 98, label: 'LIGHTHOUSE' }
  },
  {
    // [Fix] 圖片路徑修正
    id: 'mordor-gallery',
    image: '/images/works/Mordor_Gallery.webp',
    title: 'Online Gallery Shopping Cart',
    tags: ['Next.js', 'shopCart', 'TailwindCSS', 'fineArt'],
    demoUrl: 'https://photo-portfolio-nine-theta.vercel.app/',
    githubUrl: 'https://github.com/AlvinChen072380/photo-portfolio',
    role: 'Frontend Developer',
    timeline: '1 Month (Q1 2026)',
    overview: '具備購物車與後台訂單管理的全端微型電商網站。前端導入 Zustand 輕量管理跨元件狀態，並針對大量商品圖片實作虛擬化列表 (Virtualization)，將 DOM 節點數量大幅縮減，解決頁面卡頓問題。後端串接 Supabase 資料庫並設定 RLS 安全權限，防止未授權的訂單讀取。此外，也處理了 Vercel 雲端部署時常見的時區偏移問題，確保後台訂單能精確顯示台灣本地時間。',
    architecture: '選用技術：Next.js (App Router) / Supabase (PostgreSQL) / Zustand / Tailwind CSS',
    feeds: [
      { time: '01/24', text: '初始化 Next.js (App Router) 架構與 Tailwind CSS 響應式佈局' },
      { time: '01/26', text: '導入 Zustand 狀態管理，完成跨元件購物車即時同步邏輯' },
      { time: '01/27', text: '實作商品列表虛擬化 (Virtualization)，縮減 DOM 節點解決卡頓' },
      { time: '01/29', text: '配置 Supabase (PostgreSQL) 核心資料庫並啟用 RLS 安全權限' },
      { time: '01/31', text: '修正 Vercel 部署時區偏移，確保後台訂單精確同步台灣時間 (UTC+8)' }
    ],
    // [Part2] Lighthouse Performance 分數
    performance: { score: 98, label: 'LIGHTHOUSE' }
  },
  {
    // [Fix] id 改為 kebab-case，避免 URL 含空格；圖片路徑雙斜線修正；overview/architecture 對調
    id: 'personal-portfolio',
    image: '/images/works/MyPortfolio.webp',
    title: '莫藍迪色系個人網頁',
    tags: ['Next.js', 'TypeScript', 'Portfolio', 'TailwindCSS', 'Framer Motion'],
    demoUrl: 'https://portfolio-v1-dun-two.vercel.app/#Home',
    githubUrl: 'https://github.com/AlvinChen072380/portfolio-v1',
    role: 'Frontend Developer',
    timeline: '1 Month (Q1 2026)',
    overview: '以 Next.js 與 TypeScript 開發的個人互動作品集。視覺上採用莫蘭迪色系搭配 Framer Motion 實作流暢的無縫轉場動畫。為解決輪播元件在不同裝置上的體驗落差，沒有依賴現成套件，而是自行設置混合控制邏輯：手機端保留 CSS 原生滑動的順暢感，電腦端則用 JS 準確控制寬度與點擊動畫。同時針對大量攝影圖片進行 LCP 預載優化，確保在不減少畫質下提高網頁載入效能。',
    architecture: '選用技術：Next.js 14 (App Router) / TypeScript / Tailwind CSS / Framer Motion',
    feeds: [
      { time: '01/18', text: '建立 Next.js 14 & TypeScript 開發環境，配置莫蘭迪色系視覺規範' },
      { time: '01/22', text: '整合 Framer Motion 動態套件，實作頁面間無縫轉場與流暢動畫' },
      { time: '01/23', text: '優化電腦端 JS 寬度運算與手機端 CSS 原生滾動，消除裝置體驗落差' },
      { time: '01/25', text: '實施高解析度攝影圖片 LCP 預載優化，在不犧牲畫質下提升網頁效能' }
    ],
    // [Part2] 重測後確認分數（根目錄 URL 無 #Home hash）
    performance: { score: 99, label: 'LIGHTHOUSE' }
  },
  {
    id: 'book-collector',
    // 截圖放入 public/images/works/ 後更新此路徑
    image: '/images/works/BookCollector.webp',
    title: 'Book Collector Hunter',
    tags: ['Vue 3', 'Dashboard', 'CSS Grid', 'LocalStorage'],
    demoUrl: 'https://alvinchen072380.github.io/BookCollectorHunter/',
    githubUrl: 'https://github.com/AlvinChen072380/BookCollectorHunter',
    role: 'Frontend Developer',
    timeline: '1 Month (Q2 2026)',
    overview: '以 Vue 3 Composition API 開發的書籍收藏管理儀表板。支援按分類（奇幻小說、台灣文學等）管理書本收藏、附上評分與備註，並透過 localStorage 實現資料持久化。特色是採用 clip-path 製作不規則折角資料夾造型卡片，具備網格 / 列表切換與新舊排序功能，提供流暢的收藏管理體驗。',
    architecture: '選用技術：Vue 3 (Composition API) / Vue Router / CSS Grid / localStorage',
    feeds: [
      { time: '05/25', text: '建立 Vue 3 Composition API 基礎架構與 CSS Grid 儀表板佈局' },
      { time: '05/26', text: '實作 localStorage 資料持久化，完成新增 / 刪除 / 分類邏輯' },
      { time: '05/27', text: '使用 clip-path 製作資料夾折角卡片造型，完成評分滑桿元件' },
      { time: '05/28', text: '完成 RWD 三段響應式斷點（1024 / 768 / 480px），部署至 GitHub Pages' }
    ],
    performance: { score: 86, label: 'LIGHTHOUSE' }
  },
  {
    id: 'weather-practice',
    image: '/images/works/Weather.webp',
    title: 'Weather Practice App',
    tags: ['JavaScript', 'OpenWeather API', 'Web App', 'RWD'],
    demoUrl: 'https://alvinchen072380.github.io/WeatherPractice/',
    githubUrl: 'https://github.com/AlvinChen072380/WeatherPractice',
    role: 'Frontend Developer',
    timeline: '1 Week (Q2 2026)',
    overview: '以原生 JavaScript 開發的即時天氣查詢應用。串接 OpenWeatherMap API 取得全球城市的當前氣象資料，包含溫度、濕度、風速與天氣狀態圖示。採用響應式設計確保手機與桌機均有良好瀏覽體驗，並部署至 GitHub Pages 供線上存取。',
    architecture: '選用技術：Vanilla JavaScript / OpenWeatherMap API / CSS3 / GitHub Pages',
    feeds: [
      { time: '05/28', text: '建立專案架構，完成 OpenWeatherMap API 串接與城市查詢功能' },
      { time: '05/29', text: '實作天氣狀態動態圖示與溫度 / 濕度 / 風速資訊呈現' },
      { time: '05/30', text: '完成 RWD 響應式佈局，部署至 GitHub Pages' }
    ],
    performance: { score: 94, label: 'LIGHTHOUSE' }
  }
])

// 根據路由 ID 找到對應的 project 物件；找不到則為 null（防止無效 URL）
const currentProject = computed(() =>
  projects.value.find(p => p.id === route.params.id) || null
)
const isDetailView = computed(() => !!currentProject.value)

const goToProjectDetail = (projectId) => {
  router.push(`/work/${projectId}`)
}

// [Fix B] 返回時將目前專案 ID 附加為 query，讓列表還原選取狀態
// URL 例：/work?selected=book-collector
const handleGoBack = () => {
  router.push({ path: '/work', query: { selected: currentProject.value?.id } })
}

// [Fix B] 從 URL query 讀取應還原的專案 ID
const initialProjectId = computed(() => route.query.selected || null)
</script>

<template>
  <div class="works-page">
    <ProjectCardDetail
      v-if="isDetailView"
      :project="currentProject"
      @navigate-back="handleGoBack"
    />
    <WorksSection
      v-else
      :projects="projects"
      :initialProjectId="initialProjectId"
      @navigate-to-detail="goToProjectDetail"
    />
  </div>
</template>

<style scoped>
.works-page {
  /* Page specific styles */
}
</style>
