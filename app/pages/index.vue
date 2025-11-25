<template>
  <UContainer class="relative min-h-screen max-w-3xl space-y-4 py-12">
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
    <div class="grid grid-cols-3 gap-4">
      <UButton
        @click="style = 'pointing-finger'"
        :variant="style === 'pointing-finger' ? 'solid' : 'soft'"
        square
        class="flex flex-col"
      >
        <img
          src="/pointing-finger.jpg"
          alt="Pointing Finger"
          class="h-48 w-full rounded object-cover"
        />
        <p
          class="my-1 text-xs"
          :class="style === 'pointing-finger' ? 'text-white' : 'text-muted'"
        >
          Pointing Finger
        </p>
      </UButton>
      <UButton
        @click="style = 'surprised'"
        :variant="style === 'surprised' ? 'solid' : 'soft'"
        square
        class="flex flex-col"
      >
        <img
          src="/surprised.jpg"
          alt="surprised with hands on cheeks"
          class="h-48 w-full rounded object-cover"
        />
        <p
          class="my-1 text-xs"
          :class="style === 'surprised' ? 'text-white' : 'text-muted'"
        >
          Surprised
        </p>
      </UButton>
      <UButton
        @click="style = 'disappointed'"
        :variant="style === 'disappointed' ? 'solid' : 'soft'"
        square
        class="flex flex-col"
      >
        <img
          src="/disappointed.jpg"
          alt="disappointed with a thumbs down"
          class="h-48 w-full rounded object-cover"
        />
        <p
          class="my-1 text-xs"
          :class="style === 'disappointed' ? 'text-white' : 'text-muted'"
        >
          Disappointed
        </p>
      </UButton>
    </div>
    <UButton
      :loading="loading"
      :disabled="!image || !title"
      block
      label="Generate Thumbnail"
      size="lg"
      @click="generateThumbnail"
    />

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
const style = ref('pointing-finger')
const result = ref('')

const generateThumbnail = async () => {
  if (!image.value || !title.value) return

  loading.value = true
  try {
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(image.value!)
    })

    const data = await $fetch('/api/generate', {
      method: 'POST',
      body: {
        image: base64Image,
        title: title.value,
        style: style.value
      }
    })
    result.value = data as string
  } catch (error) {
    console.error(error)
    alert('Failed to generate thumbnail')
  } finally {
    loading.value = false
  }
}
</script>
