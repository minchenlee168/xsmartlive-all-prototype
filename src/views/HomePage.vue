<script setup lang="ts">
import NavBar from '../components/NavBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import BannerCarousel from '../components/BannerCarousel.vue'
import AnnouncementSection from '../components/AnnouncementSection.vue'
import ThemeBanner from '../components/ThemeBanner.vue'
import ProductGrid from '../components/ProductGrid.vue'
</script>

<template>
  <div class="min-h-screen" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <main class="max-w-[1280px] mx-auto" style="padding: var(--page-pad-y) var(--page-pad-x)">
      <div class="flex flex-col" style="gap: var(--stack-gap)">
        <BannerCarousel />
        <AnnouncementSection />
        <ThemeBanner />
        <ProductGrid />
      </div>
    </main>
  </div>
</template>
