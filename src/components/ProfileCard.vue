<script setup>
defineProps({
  profile: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="profile-hero">
    <!-- 左側圖片區塊 -->
    <div class="profile-image-wrapper">
      <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
      <div v-else class="placeholder-image">Hero Image Area</div>
    </div>

    <!-- 右側文案區塊 -->
    <div class="profile-content">
      <div class="tag-pill">{{ profile.title }}</div>
      
      <h1 class="headline">
        Hello! I'm<br/>
        <span class="highlight">{{ profile.name }}</span>
      </h1>
      
      <!-- 單欄大段落顯示 bio -->
      <div class="bio-section">
        <p class="bio-text">{{ profile.bio }}</p>
      </div>

      <div class="action-buttons">
        <a 
          v-for="(link, index) in profile.links" 
          :key="link.platform" 
          :href="link.url" 
          target="_blank" 
          class="btn"
          :class="index === 0 ? 'primary' : 'secondary'"
        >
          {{ link.platform }} {{ index === 0 ? '↗' : '→' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-hero {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 4rem;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 1.5rem;
  background-color: #d5cfc6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.5rem;
  font-weight: bold;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.profile-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tag-pill {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  color: var(--accent-color);
}

.headline {
  font-size: 4.5rem;
  font-weight: 500;
  line-height: 1.1;
  margin: 0;
  color: var(--text-primary);
}

.highlight {
  color: var(--accent-color);
  font-family: serif;
  font-style: italic;
}

.bio-section {
  margin-top: 1rem;
}

.bio-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-muted);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 2rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn.primary {
  background-color: var(--accent-color);
  color: white;
}

.btn.primary:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
}

.btn.secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--text-primary);
}

.btn.secondary:hover {
  background-color: var(--text-primary);
  color: var(--bg-primary);
}

/* RWD 調整 */
@media (max-width: 992px) {
  .profile-hero {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .profile-image-wrapper {
    aspect-ratio: 16/9;
  }
  .headline {
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .profile-image-wrapper {
    aspect-ratio: 4/3;
  }
  .headline {
    font-size: 2.8rem;
  }
  .bio-text {
    font-size: 1.1rem;
  }
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  .btn {
    width: 85%;
  }
}
</style>
