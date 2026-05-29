<script setup>
import { ref } from 'vue'

const startProject = () => {
  console.log("Start Project Clicked")
}
</script>

<template>
  <section class="hero-section">
    <!-- 左側圖片區塊 -->
    <div class="hero-image-wrapper">
      <div class="placeholder-image">Hero Image Area</div>
    </div>

    <!-- 右側文案區塊 -->
    <div class="hero-content">
      <div class="tag-pill">Start Your Journey, Craft Your Identity</div>
      
      <h1 class="headline">
        Crafting High-<br/>
        Performance <span class="highlight">Digital<br/>Experiences.</span>
      </h1>
      
      <div class="description-grid">
        <div class="desc-column">
          <h4 class="desc-title">Solution</h4>
          <p>Unlock the power of expert design. From bespoke branding and innovative web design to seamless app UI/UX, we offer all-in-one solutions tailored to elevate your tech startup's presence.</p>
        </div>
        <div class="desc-column">
          <p class="desc-text-only">Experience simplicity with our streamlined process. We bring you onboard our project management tool, ensuring transparency and effective collaboration at every step of the design journey.</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn primary" @click="startProject">Start a Project ↗</button>
        <button class="btn secondary">Production →</button>
        <button class="btn secondary">Results →</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 4rem;
  align-items: center;
}

.hero-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 1.5rem;
  background-color: #d5cfc6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.tag-pill {
  display: inline-block;
  border: 1px solid var(--accent-color);
  color: var(--accent-color);
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.headline {
  font-size: 4rem;
  line-height: 1.1;
  font-weight: 500;
  margin: 0 0 3rem 0;
}

.highlight {
  color: var(--accent-color);
}

.description-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.desc-title {
  color: var(--accent-color);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.description-grid p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.desc-text-only {
  margin-top: 1.8rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn.primary {
  background-color: var(--accent-color);
  color: white;
  border: none;
}

.btn.secondary {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid #ccc;
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .hero-image-wrapper {
    aspect-ratio: 16/9; /* Change to landscape on tablet/mobile */
  }
  .headline {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .headline {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }
  .description-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .desc-text-only {
    margin-top: 0;
  }
  .action-buttons {
    flex-wrap: wrap;
  }
  .btn {
    flex: 1 1 calc(50% - 1rem);
    text-align: center;
  }
  .btn.primary {
    flex: 1 1 100%;
  }
}
</style>
