export default defineEventHandler(async event => {
  const { cloudflare } = event.context
  
  if (!cloudflare?.env?.THUMBNAIL_RATE_LIMIT_KV) {
    // Return 0 in local dev or when KV is not available
    return { total: 0 }
  }
  
  const totalKey = 'total_generations'
  const totalData = await cloudflare.env.THUMBNAIL_RATE_LIMIT_KV.get(totalKey)
  const total = totalData ? parseInt(totalData, 10) : 0
  
  return { total }
})

