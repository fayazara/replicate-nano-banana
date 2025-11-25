<template>
  <UContainer class="relative min-h-screen max-w-2xl space-y-4 py-12">
    <h1 class="text-center font-bold">Youtube Thumbnail Generator</h1>
    <UFileUpload
      v-model="image"
      class="min-h-40"
      accept="image/jpeg, image/png"
      label="Drop your picture here"
      description="PNG or JPG"
      layout="list"
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
          class="h-40 w-full rounded-lg object-cover"
        />
        <p class="my-1 text-xs">Pointing Finger</p>
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
          class="h-40 w-full rounded-lg object-cover"
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
          class="h-40 w-full rounded-lg object-cover"
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

    <div v-if="statusMessage" class="mt-4">
      <UAlert
        :color="
          statusMessage.type === 'error'
            ? 'red'
            : statusMessage.type === 'success'
              ? 'green'
              : 'blue'
        "
        :title="statusMessage.title"
        :description="statusMessage.description"
      />
    </div>
    <div v-if="loading" class="relative mt-4 h-64 w-full overflow-hidden rounded-lg">
      <DitheredAnimation />
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
const statusMessage = ref<{
  type: 'warning' | 'success' | 'error'
  title: string
  description?: string
} | null>(null)

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
          statusMessage.value = {
            type: 'success',
            title: 'Thumbnail generated successfully!',
            description: 'Your thumbnail is ready.'
          }
          loading.value = false
          return
        }
      } else if (status.status === 'failed' || status.status === 'canceled') {
        statusMessage.value = {
          type: 'error',
          title: 'Generation failed',
          description:
            status.error || 'The thumbnail generation failed. Please try again.'
        }
        loading.value = false
        return
      } else if (
        status.status === 'processing' ||
        status.status === 'starting'
      ) {
        statusMessage.value = {
          type: 'warning',
          title: 'Generating thumbnail...',
          description: 'This may take 20-30 seconds. Please wait.'
        }
        attempts++
        if (attempts >= maxAttempts) {
          statusMessage.value = {
            type: 'error',
            title: 'Timeout',
            description:
              'The generation is taking longer than expected. Please try again.'
          }
          loading.value = false
          return
        }
        setTimeout(poll, 5000)
      }
    } catch (error) {
      console.error('Error polling status:', error)
      statusMessage.value = {
        type: 'error',
        title: 'Error checking status',
        description: 'Failed to check generation status. Please try again.'
      }
      loading.value = false
    }
  }
  poll()
}

const generateThumbnail = async () => {
  if (!image.value || !title.value) return

  loading.value = true
  result.value = ''
  statusMessage.value = {
    type: 'warning',
    title: 'Starting generation...',
    description: 'Creating your thumbnail request.'
  }

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
    statusMessage.value = {
      type: 'error',
      title: 'Failed to generate thumbnail',
      description:
        error?.data?.message ||
        error?.message ||
        'An error occurred. Please try again.'
    }
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
