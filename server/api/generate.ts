import Replicate from 'replicate'

const RATE_LIMIT_MAX = 3

function getClientIp(event: any): string {
  return (
    event.headers.get('cf-connecting-ip') ||
    event.headers.get('x-forwarded-for')?.split(',')[0] ||
    'unknown'
  )
}

function getSecondsUntilMidnight(): number {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setUTCHours(0, 0, 0, 0)
  
  if (nextMidnight.getTime() <= now.getTime()) {
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1)
  }
  
  return Math.floor((nextMidnight.getTime() - now.getTime()) / 1000)
}

async function checkRateLimit(
  kv: any,
  ipAddress: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const rateLimitKey = `rate_limit:${ipAddress}:${today}`
  
  const currentData = await kv.get(rateLimitKey)
  const currentCount = currentData ? parseInt(currentData, 10) : 0
  
  if (currentCount >= RATE_LIMIT_MAX) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Rate limit exceeded. You can create up to 3 thumbnails per day.'
    })
  }
  
  await kv.put(rateLimitKey, (currentCount + 1).toString(), {
    expirationTtl: getSecondsUntilMidnight()
  })
}

async function incrementTotalGenerations(kv: any): Promise<void> {
  const totalKey = 'total_generations'
  const currentTotal = await kv.get(totalKey)
  const newTotal = currentTotal ? parseInt(currentTotal, 10) + 1 : 1
  await kv.put(totalKey, newTotal.toString())
}

function generatePrompt(title: string, style?: string): string {
  const basePrompt = `Make a youtube thumbnail using this person`
  const commonSuffix = `White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`
  
  switch (style) {
    case 'pointing-finger':
      return `${basePrompt} pointing towards text "${title}" ${commonSuffix}`
    case 'surprised':
      return `${basePrompt} with a surprised expression looking at text "${title}" ${commonSuffix}`
    case 'disappointed':
      return `${basePrompt} with a disappointed expression looking at text "${title}" ${commonSuffix}`
    default:
      return `${basePrompt} pointing towards text "${title}" ${commonSuffix}`
  }
}

function validateRequest(body: any): void {
  if (!body.image || !body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image and title are required'
    })
  }
}

function createReplicateInput(image: string, title: string, style?: string) {
  return {
    prompt: generatePrompt(title, style),
    resolution: '1K',
    image_input: [image],
    aspect_ratio: '16:9',
    output_format: 'png',
    safety_filter_level: 'block_only_high' as const
  }
}

function getWebhookHost(event: any): string | undefined {
  const config = useRuntimeConfig(event)
  return (
    (typeof process !== 'undefined' && process.env?.WEBHOOK_HOST) ||
    config.WEBHOOK_HOST
  )
}

export default defineEventHandler(async event => {
  const { cloudflare } = event.context
  
  if (cloudflare?.env?.THUMBNAIL_RATE_LIMIT_KV) {
    const ipAddress = getClientIp(event)
    await checkRateLimit(cloudflare.env.THUMBNAIL_RATE_LIMIT_KV, ipAddress)
  }
  
  const replicate = new Replicate({
    auth: useRuntimeConfig(event).REPLICATE_API_TOKEN
  })
  
  const body = await readBody(event)
  validateRequest(body)
  
  const { image, title, style } = body
  const input = createReplicateInput(image, title, style)
  
  const webhookHost = getWebhookHost(event)
  const options: any = {
    model: 'google/nano-banana-pro',
    input
  }
  
  if (webhookHost) {
    options.webhook = `${webhookHost}/api/webhooks`
    options.webhook_events_filter = ['start', 'completed']
  }
  
  const prediction = await replicate.predictions.create(options)
  
  if (prediction?.error) {
    throw createError({
      statusCode: 500,
      statusMessage: (prediction.error as string) || 'Failed to create prediction'
    })
  }
  
  // Increment total generations counter after successful creation
  if (cloudflare?.env?.THUMBNAIL_RATE_LIMIT_KV) {
    await incrementTotalGenerations(cloudflare.env.THUMBNAIL_RATE_LIMIT_KV)
  }
  
  return {
    id: prediction.id,
    status: prediction.status,
    createdAt: prediction.created_at
  }
})
