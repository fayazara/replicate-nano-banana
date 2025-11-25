import Replicate from 'replicate'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prediction ID is required'
    })
  }

  const replicate = new Replicate({
    auth: useRuntimeConfig(event).REPLICATE_API_TOKEN
  })

  try {
    const prediction = await replicate.predictions.get(id)

    return {
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
      createdAt: prediction.created_at,
      completedAt: prediction.completed_at
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to fetch prediction status'
    })
  }
})

