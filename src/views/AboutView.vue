<script setup>
import { ref } from 'vue'
import ProfileCard from '../components/ProfileCard.vue'

const base = import.meta.env.BASE_URL

const profileData = ref({
  name: 'Alvin Chen',
  title: 'Developer',
  avatar: `${base}images/works/portfolioPhoto.jpg`,
  bio: '設計師出身、曾任咖啡師，現為前端開發者。我相信好的程式碼如同一杯精品咖啡——需要嚴謹的配方、層層疊加的細節，以及對使用者的極致追求。這段跨領域旅程讓我能同時用設計師的眼睛與工程師的邏輯開發產品，並持續深耕 JavaScript 與 Vue 3 進階應用。',
  links: [
    { platform: 'GitHub', url: 'https://github.com/AlvinChen072380' },
    { platform: '104', url: 'https://pda.104.com.tw/profile/edit?vno=74rk3wa0w' },
  ]
})
</script>

<template>
  <div class="about-page">
    <ProfileCard :profile="profileData" />
  </div>
</template>

<style scoped>
.about-page {
  /* [Fix #8b] 移除多餘水平 padding，app-container 已有全域 padding */
  /* [Fix #8b] min-height: auto 只是取消限制，非「扣除 NavBar 高度」 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5rem;
}

</style>
