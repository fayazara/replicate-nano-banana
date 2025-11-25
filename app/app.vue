<template>
  <UApp
    :toaster="{
      position: 'top-center',
      progress: false
    }"
  >
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>

<script setup>
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Replicate - Nano Banana'
const description = 'Replicate Nano Banana'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>
