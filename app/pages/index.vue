<template>
  <UContainer class="relative min-h-screen max-w-xl space-y-4 py-12">
    <h1 class="text-center font-bold">Youtube Thumbnail Generator</h1>
    <UFileUpload
      v-model="image"
      class="min-h-48"
      accept="image/jpeg, image/png"
      label="Drop your picture here"
      description="PNG or JPG"
      layout="list"
    />
    <UInput v-model="title" placeholder="Title" class="w-full" size="lg" />
    <UButton
      :loading="loading"
      :disabled="!image || !title"
      @click="generateThumbnail"
      block
      size="lg"
    >
      Generate Thumbnail
    </UButton>

    <div v-if="result" class="mt-4">
      <img :src="result" alt="Generated Thumbnail" class="w-full rounded-lg" />
    </div>
    <div
      class="text-muted absolute bottom-0 flex h-12 w-full items-center justify-center text-sm"
    >
      <p>
        Made with Cloudflare Workers and Replicate by
        <a href="https://twitter.com/fayazara">@fayazara</a>
      </p>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const image = ref<File | null>(null)
const title = ref('')
const loading = ref(false)
const result = ref('')

const generateThumbnail = async () => {
  if (!image.value || !title.value) return

  loading.value = true
  try {
    const reader = new FileReader()
    reader.readAsDataURL(image.value)
    reader.onload = async () => {
      const base64Image = reader.result
      const data = await $fetch('/api/generate', {
        method: 'POST',
        body: {
          image: base64Image,
          title: title.value
        }
      })
      result.value = data as string
    }
  } catch (error) {
    console.error(error)
    alert('Failed to generate thumbnail')
  } finally {
    loading.value = false
  }
}
</script>
