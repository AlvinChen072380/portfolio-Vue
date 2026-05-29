<script setup>
import { ref } from 'vue'
import ProfileCard from '../components/ProfileCard.vue'

// 模擬由上層 (View) 提供的資料
const profileData = ref({
  name: 'Alex Developer',
  title: 'Senior Frontend Engineer',
  avatar: '', // 留空以展示大寫首字母的佔位符
  bio: 'Hello! I am a passionate frontend developer specializing in Vue.js and modern web technologies. I love creating beautiful, performant, and accessible user interfaces. With over 5 years of experience, I bring ideas to life through code.',
  links: [
    { platform: 'GitHub', url: 'https://github.com' },
    { platform: 'LinkedIn', url: 'https://linkedin.com' },
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
  padding: 0rem 2rem;
  min-height: auto; /* 扣除 NavBar 高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
