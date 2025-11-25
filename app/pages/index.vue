<template>
  <UContainer class="relative min-h-screen max-w-2xl space-y-4 py-12">
    <div class="space-y-2">
      <h1 class="text-center font-bold">Youtube Thumbnail Generator</h1>
      <div class="text-center text-sm text-muted">
        <span class="font-semibold">{{ totalGenerations.toLocaleString() }}</span>
        <span class="ml-1">thumbnails generated</span>
      </div>
    </div>
    <UFileUpload
      v-model="image"
      accept="image/jpeg, image/png"
      layout="list"
      label="Drop your picture here"
      position="inside"
    />
    <UInput v-model="title" placeholder="Title" class="w-full" size="lg" />
    <div class="grid grid-cols-3 gap-4">
      <UButton
        @click="style = 'pointing-finger'"
        :variant="style === 'pointing-finger' ? 'subtle' : 'soft'"
        square
        :color="style === 'pointing-finger' ? 'warning' : 'neutral'"
        class="flex flex-col rounded-xl"
      >
        <img
          src="/pointing-finger.jpg"
          alt="Pointing Finger"
          class="h-24 w-full rounded-lg object-cover sm:h-40"
        />
        <p class="my-1 text-xs">Pointing Text</p>
      </UButton>
      <UButton
        @click="style = 'surprised'"
        :variant="style === 'surprised' ? 'subtle' : 'soft'"
        square
        :color="style === 'surprised' ? 'warning' : 'neutral'"
        class="flex flex-col rounded-xl"
      >
        <img
          src="/surprised.jpg"
          alt="surprised with hands on cheeks"
          class="h-24 w-full rounded-lg object-cover sm:h-40"
        />
        <p class="my-1 text-xs">Surprised</p>
      </UButton>
      <UButton
        @click="style = 'disappointed'"
        :variant="style === 'disappointed' ? 'subtle' : 'soft'"
        square
        :color="style === 'disappointed' ? 'warning' : 'neutral'"
        class="flex flex-col rounded-xl"
      >
        <img
          src="/disappointed.jpg"
          alt="disappointed with a thumbs down"
          class="h-24 w-full rounded-lg object-cover sm:h-40"
        />
        <p class="my-1 text-xs">Disappointed</p>
      </UButton>
    </div>
    <UButton
      :loading="loading"
      :disabled="!image || !title"
      block
      label="Generate Thumbnail"
      size="xl"
      @click="generateThumbnail"
    />

    <div
      v-if="loading"
      class="relative mt-4 h-64 w-full overflow-hidden rounded-lg"
    >
      <ClientOnly>
        <DitheredAnimation />
      </ClientOnly>
    </div>
    <div v-if="result" class="relative mt-4">
      <img :src="result" alt="Generated Thumbnail" class="w-full rounded-lg" />
      <UButton
        icon="i-lucide-download"
        class="absolute right-2 bottom-2"
        @click="downloadThumbnail"
      />
    </div>
    <div
      class="text-muted absolute bottom-0 left-0 flex h-12 w-full items-center justify-center text-sm"
    >
      <p class="text-center">
        Made with Cloudflare Workers and Replicate by
        <a
          target="_blank"
          class="text-default font-medium"
          href="https://twitter.com/fayazara"
          >@fayazara</a
        >, find the code on
        <a
          target="_blank"
          class="text-default font-medium"
          href="https://github.com/fayazara/replicate-nano-banana"
          >GitHub</a
        >
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
const toast = useToast()
const totalGenerations = ref(0)

// Fetch total generations count
const { data: stats } = await useFetch<{ total: number }>('/api/stats', {
  server: false
})

if (stats.value) {
  totalGenerations.value = stats.value.total
}

// Refresh count after successful generation
const refreshStats = async () => {
  try {
    const stats = await $fetch<{ total: number }>('/api/stats')
    if (stats) {
      totalGenerations.value = stats.total
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}
const pollStatus = async (predictionId: string) => {
  const maxAttempts = 60 // Poll for up to 5 minutes (60 * 5 seconds)
  let attempts = 0

  const poll = async (): Promise<void> => {
    try {
      const status = await $fetch<{
        id: string
        status: string
        output?: string | string[]
        error?: string
      }>(`/api/status/${predictionId}`)

      if (status.status === 'succeeded') {
        // Handle output - Replicate returns array or string
        const outputUrl = Array.isArray(status.output)
          ? status.output[0]
          : status.output
        if (outputUrl) {
          result.value = outputUrl
          loading.value = false
          // Refresh stats after successful generation
          await refreshStats()
          return
        }
      } else if (status.status === 'failed' || status.status === 'canceled') {
        toast.add({
          title: 'Generation failed',
          description:
            status.error ||
            'The thumbnail generation failed. Please try again.',
          icon: 'i-lucide-circle-alert'
        })
        loading.value = false
        return
      } else if (
        status.status === 'processing' ||
        status.status === 'starting'
      ) {
        attempts++
        if (attempts >= maxAttempts) {
          toast.add({
            title: 'Timeout',
            description:
              'The generation is taking longer than expected. Please try again.',
            icon: 'i-lucide-circle-alert'
          })
          loading.value = false
          return
        }
        setTimeout(poll, 5000)
      }
    } catch (error) {
      console.error('Error polling status:', error)
      toast.add({
        title: 'Error checking status',
        description: 'Failed to check generation status. Please try again.',
        icon: 'i-lucide-circle-alert'
      })
      loading.value = false
    }
  }
  poll()
}

const generateThumbnail = async () => {
  if (!image.value || !title.value) return

  loading.value = true
  result.value = ''

  try {
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(image.value!)
    })

    const data = await $fetch<{ id: string; status: string }>('/api/generate', {
      method: 'POST',
      body: {
        image: base64Image,
        title: title.value,
        style: style.value
      }
    })

    // Start polling for status
    await pollStatus(data.id)
  } catch (error: any) {
    console.error(error)
    toast.add({
      title: 'Failed to generate thumbnail',
      description:
        error?.data?.message ||
        error?.message ||
        'An error occurred. Please try again.',
      icon: 'i-lucide-circle-alert'
    })
    loading.value = false
  }
}

const downloadThumbnail = () => {
  const link = document.createElement('a')
  link.href = result.value
  link.download = `${title.value}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
</script>
