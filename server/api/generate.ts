import Replicate from 'replicate'

export default defineEventHandler(async event => {
  const replicate = new Replicate({
    auth: useRuntimeConfig().REPLICATE_API_TOKEN
  })

  const body = await readBody(event)
  const { image, title } = body

  if (!image || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image and title are required'
    })
  }

  const input = {
    prompt: `Make a youtube thumbnail using this person pointing towards text "${title}" White silhouette border around the persons headshot. Add cloudflare logo.\n\nSimple modern background`,
    resolution: '1K',
    image_input: [image],
    aspect_ratio: '16:9',
    output_format: 'png',
    safety_filter_level: 'block_only_high'
  }

  const output = await replicate.run('google/nano-banana-pro', { input })

  // @ts-ignore
  return output.url()
})
