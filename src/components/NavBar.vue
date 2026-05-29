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
      <span class="logo-icon">⁂</span>
      <span class="logo-text">Expert Artisan</span>
    </router-link>
    
    <nav class="nav-links" :class="{ 'is-open': isMenuOpen }">
      <router-link to="/about" @click="isMenuOpen = false">About</router-link>
      <router-link to="/skill" @click="isMenuOpen = false">Skill</router-link>
      <router-link to="/work" @click="isMenuOpen = false">Work</router-link>
    </nav>
    
    <button class="menu-btn" @click="toggleMenu" style="z-index: 1001;">
      {{ isMenuOpen ? 'Close' : 'Menu' }} <span class="arrow">{{ isMenuOpen ? '↑' : '↓' }}</span>
    </button>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
}

.nav-links {
  display: flex;
  gap: 2rem;
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

.menu-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    gap: 3rem;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
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
