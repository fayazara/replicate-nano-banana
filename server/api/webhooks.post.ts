import Replicate from 'replicate'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  // Replicate sends webhook events with this structure
  // We can log or store the completion status here
  console.log('Webhook received:', {
    id: body.id,
    status: body.status,
    output: body.output
  })

  // If you want to store results in Cloudflare KV, you can do it here
  // const { cloudflare } = event.context
  // if (cloudflare?.env?.PREDICTIONS_KV && body.status === 'succeeded') {
  //   await cloudflare.env.PREDICTIONS_KV.put(body.id, JSON.stringify({
  //     status: body.status,
  //     output: body.output,
  //     completedAt: new Date().toISOString()
  //   }))
  // }

  return { received: true }
})

