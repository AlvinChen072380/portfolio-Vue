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
    image: '/images/works/Hi_refrigerator.png',
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
    image: '/images/works/Mordor_Gallery.png',
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
    image: '/images/works/MyPortfolio.png',
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

const handleGoBack = () => {
  router.push('/work')
}
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
      @navigate-to-detail="goToProjectDetail"
    />
  </div>
</template>

<style scoped>
.works-page {
  /* Page specific styles */
}
</style>
