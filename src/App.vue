<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 全域 CSS 變數定義 */
:root {
  --bg-primary: #EBE4DB;
  --text-primary: #333333;
  --text-muted: #666666;
  --accent-color: #B53A26;
  --accent-hover: #9A301E;
  --card-bg: #FFFFFF;
}

body {
  
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0rem 4rem;
  min-height: 100dvh;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 8rem;
  margin-top: 2rem;
  padding: 0rem 0rem;
}

@media (max-width: 768px) {
  .app-container {
    padding: 0rem 1.5rem;
  }
  .main-content {
    gap: 4rem;
    margin-top: 2rem;
  }
}
</style>
