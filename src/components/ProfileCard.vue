<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrambleTextPlugin)

defineProps({
  profile: {
    type: Object,
    required: true
  }
})

// [GSAP Step J] template refs — 右側各內容區塊依序進場
const imageRef = ref(null)
const tagRef = ref(null)
const helloRef = ref(null)
const highlightRef = ref(null)
const bioRef = ref(null)
const btnsRef = ref(null)

// [GSAP Fix] 用 gsap.context() 追蹤所有動畫，onUnmounted 時 revert() 一次清除
let gsapCtx = null

onMounted(async () => {
  // [GSAP Fix] nextTick 等 Vue 完成 DOM 更新後再啟動動畫
  // 避免與頁面切換的 opacity 動畫疊加，導致 opacity 相乘產生半透明效果
  await nextTick()

  gsapCtx = gsap.context(() => {
    // 立刻隱藏，避免 Vue 渲染完整文字後才開始動畫的閃爍
    gsap.set(highlightRef.value, { autoAlpha: 0 })

    const tl = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'all' } })

    tl.from(imageRef.value,  { opacity: 0, x: -20, duration: 0.5 })
      .from(tagRef.value,    { opacity: 0, y: 10,  duration: 0.3 }, '-=0.15')
      .from(helloRef.value,  { opacity: 0, x: -15, duration: 0.4 }, '-=0.15')
      .to(highlightRef.value, {
        duration: 1.2,
        scrambleText: {
          text: highlightRef.value.textContent.trim(),
          chars: 'upperCase',
          revealDelay: 0.3,
          speed: 0.4,
        },
        ease: 'none',
        // ScrambleText 開始的瞬間才解除隱藏，避免完整文字閃現
        onStart: () => gsap.set(highlightRef.value, { autoAlpha: 1 }),
      }, '-=0.1')
      .from(bioRef.value,    { opacity: 0, y: 10,  duration: 0.35 }, '-=0.5')
      .from(btnsRef.value.children, {
        opacity: 0, y: 8, duration: 0.3, stagger: 0.08
      }, '-=0.1')
  })
})

// [GSAP Fix] 元件卸載時 revert() — 殺掉所有進行中的 tween 並清除 inline style
onUnmounted(() => gsapCtx?.revert())
</script>

<template>
  <div class="profile-hero">
    <!-- 左側圖片區塊 -->
    <div class="profile-image-wrapper" ref="imageRef">
      <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
      <div v-else class="placeholder-image">Hero Image Area</div>
      <div class="tag-pill on-photo" ref="tagRef">{{ profile.title }}</div>
    </div>

    <!-- 右側文案區塊 -->
    <div class="profile-content">

      <h1 class="headline">
        <span ref="helloRef">Hello! I'm</span><br/>
        <span class="highlight" ref="highlightRef">{{ profile.name }}</span>
      </h1>

      <!-- 單欄大段落顯示 bio -->
      <div class="bio-section" ref="bioRef">
        <p class="bio-text">{{ profile.bio }}</p>
      </div>

      <div class="action-buttons" ref="btnsRef">
        <a
          v-for="(link, index) in profile.links"
          :key="link.platform"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
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
  gap: var(--space-8);
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
  position: relative;
  /* [Shadow] 主視覺圖片使用高層陰影，Token 取代硬編碼 */
  box-shadow: var(--shadow-lg);
}

.profile-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tag-pill {
  align-self: flex-start;
  padding: var(--space-1) var(--space-2);
  background-color: white;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  color: var(--accent-color);
}

.tag-pill.on-photo {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
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
  margin-top: var(--space-2);
}

.bio-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--text-muted);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.btn {
  padding: var(--space-2) var(--space-4);
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
    gap: var(--space-6);
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
