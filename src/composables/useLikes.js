import { ref, watch } from 'vue'

// 定義在模組頂層的全域狀態
// 這樣不管是在哪個組件呼叫 useLikes()，大家拿到的都會是同一份資料
const likedProjects = ref({})
let isInitialized = false

export function useLikes() {
  if (!isInitialized) {
    // 初次掛載時從 localStorage 讀取
    const saved = localStorage.getItem('portfolio_likes')
    if (saved) {
      try {
        likedProjects.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse likes', e)
      }
    }
    
    // 監聽狀態改變，自動同步至 localStorage
    watch(likedProjects, (newVal) => {
      localStorage.setItem('portfolio_likes', JSON.stringify(newVal))
    }, { deep: true })

    isInitialized = true
  }

  const toggleLike = (projectId) => {
    if (likedProjects.value[projectId]) {
      delete likedProjects.value[projectId]
    } else {
      likedProjects.value[projectId] = true
    }
  }

  const isLiked = (projectId) => {
    return !!likedProjects.value[projectId]
  }

  return {
    likedProjects,
    toggleLike,
    isLiked
  }
}
