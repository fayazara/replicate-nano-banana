<template>
  <canvas ref="canvasRef" class="w-full h-full"></canvas>
</template>

<script lang="ts" setup>
const canvasRef = ref<HTMLCanvasElement | null>(null)

const CHARS = ['.', '·', ':', '*', '+', 'x', '#', '@']

let animationFrameId: number | null = null
let resizeHandler: (() => void) | null = null

onMounted(() => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let dpr = window.devicePixelRatio || 1

  const resize = () => {
    if (!canvas.parentElement) return
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // use CSS pixels
  }

  resizeHandler = resize

  const draw = (ts: number) => {
    if (!canvas) return

    const t = ts * 0.001
    const { width, height } = canvas.getBoundingClientRect()

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)

    const cell = 14
    ctx.font = '12px Menlo, "SF Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const cx = width / 2 + Math.cos(t * 0.5) * 40
    const cy = height / 2 + Math.sin(t * 0.8) * 30

    const pulseRadius = 100 + Math.sin(t * 2) * 30

    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        const dx = x - cx
        const dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        const wave = Math.sin(x * 0.06 + y * 0.08 + t * 3)
        const ring = Math.max(0, 1 - Math.abs(dist - pulseRadius) / 120)
        const noise = Math.sin(x * 0.14 + t * 5) * Math.cos(y * 0.11 - t * 4)

        const intensity = (wave * 0.4 + ring * 0.9 + noise * 0.5 + 1.3) / 2.6
        if (intensity < 0.15) continue

        const idx = Math.min(
          Math.floor(intensity * (CHARS.length - 1)),
          CHARS.length - 1
        )
        const char = CHARS[idx]
        if (!char) continue

        const alpha = 0.15 + intensity * 0.85

        // soft purple-gray ink look
        ctx.fillStyle = `rgba(60,60,80,${alpha})`
        ctx.fillText(char, x, y)
      }
    }

    animationFrameId = requestAnimationFrame(draw)
  }

  window.addEventListener('resize', resize)
  resize()
  animationFrameId = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>
