import Replicate from 'replicate'

export default defineEventHandler(async event => {
  const replicate = new Replicate({
    auth: useRuntimeConfig(event).REPLICATE_API_TOKEN
  })

  const body = await readBody(event)
  const { image, title, style } = body

  if (!image || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image and title are required'
    })
  }

  let prompt = ''

  switch (style) {
    case 'pointing-finger':
      prompt = `Make a youtube thumbnail using this person pointing towards text "${title}" White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`
      break
    case 'surprised':
      prompt = `Make a youtube thumbnail using this person with a surprised expression looking at text "${title}" White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`
      break
    case 'disappointed':
      prompt = `Make a youtube thumbnail using this person with a disappointed expression looking at text "${title}" White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`
      break
    default:
      prompt = `Make a youtube thumbnail using this person pointing towards text "${title}" White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`
  }

  const input = {
    prompt,
    resolution: '1K',
    image_input: [image],
    aspect_ratio: '16:9',
    output_format: 'png',
    safety_filter_level: 'block_only_high'
  }

  const config = useRuntimeConfig(event)
  const webhookHost =
    (typeof process !== 'undefined' && process.env?.WEBHOOK_HOST) ||
    config.WEBHOOK_HOST

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
      statusMessage:
        (prediction.error as string) || 'Failed to create prediction'
    })
  }

  return {
    id: prediction.id,
    status: prediction.status,
    createdAt: prediction.created_at
  }
})
