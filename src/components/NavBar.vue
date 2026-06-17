<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="logo" @click="isMenuOpen = false">
      <span class="logo-icon"></span>
      <span class="logo-text">Alvin's Portfolio</span>
    </router-link>
    
    <nav class="nav-links" :class="{ 'is-open': isMenuOpen }">
      <router-link to="/about" @click="isMenuOpen = false">About</router-link>
      <router-link to="/skill" @click="isMenuOpen = false">Skill</router-link>
      <router-link to="/work" @click="isMenuOpen = false">Projects</router-link>
    </nav>
    
    <!-- [Fix #8a] 移除重複的 inline z-index，scoped CSS 已有相同設定 -->
    <button class="menu-btn" @click="toggleMenu">
      {{ isMenuOpen ? 'Close' : 'Menu' }} <span class="arrow">{{ isMenuOpen ? '↑' : '↓' }}</span>
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  /* [Fix] 移除 filter: drop-shadow
     filter 會讓 position:fixed 的子元素（.nav-links 手機選單）
     以 .app-header 為定位基準，而非 viewport，導致選單無法全螢幕覆蓋 */
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
   text-decoration: none;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: var(--space-4);
}

.nav-links a {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--accent-color);
}

/* [UX] Active route — 讓使用者知道目前所在頁面 */
.nav-links a.router-link-active {
  color: var(--accent-color);
  font-weight: 600;
}

.menu-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: var(--space-1) var(--space-2);
  border-radius: 2rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  z-index: 1001; /* Ensure button stays on top of overlay */
}

@media (min-width: 769px) {
  .menu-btn {
    display: none; /* Hide button on desktop */
  }
}

@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100dvh;
    background-color: var(--bg-primary, #EBE4DB);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  /* 漢堡選單橢圓光暈：從中心向外拓散，填滿整個 overlay */
  .nav-links::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background: radial-gradient(ellipse 65% 78% at center,
      rgba(210, 111, 50, 0.30) 0%,
      rgba(181, 57, 38, 0.15) 45%,
      rgba(245, 244, 244, 0) 100%
    );
  }
  
  .nav-links.is-open {
    opacity: 1;
    pointer-events: auto;
  }
  
  .nav-links a {
    font-size: 2.5rem;
    font-weight: 600;
  }
  
  .logo {
    z-index: 1001; /* Keep logo on top of menu overlay */
  }
}
</style>
