import * as apiKey from './models/api-key.js'
import log from './log.js'

export async function ensureValidApiKey(context, next) {
  const token = context.headers['x-api-key'] || context.query['api_key']
  if (!token) {
    log.warn('API called without API key')
    context.body = {
      error: 'X-API-Key header or api_key query parameter is required.',
    }
    context.status = 401
    return
  }
  const ak = await apiKey.findByToken(token)
  if (!ak) {
    log.warn('API called with invalid API key token:', token)
    context.body = { error: 'Invalid API key token.' }
    context.status = 401
    return
  }
  context.state.apiKey = ak
  await next()
}

export async function ensureReadPermission(context, next) {
  if (!context.state.apiKey || !context.state.apiKey.canRead) {
    log.warn('Read permission denied for apiKey:', context.state.apiKey)
    context.body = { error: 'Read permission required.' }
    context.status = 403
    return
  }
  await next()
}

export async function ensureWritePermission(context, next) {
  if (!context.state.apiKey || !context.state.apiKey.canWrite) {
    log.warn('Write permission denied for apiKey:', context.state.apiKey)
    context.body = { error: 'Write permission required.' }
    context.status = 403
    return
  }
  await next()
}
