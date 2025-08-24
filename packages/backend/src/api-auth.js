import * as apiKey from './models/api-key.js'
import log from './log.js'

export async function ensureValidApiKey(req, res, next) {
  const token = req.headers['x-api-key'] || req.query['api_key']
  if (!token) {
    log.warn('API called without API key')
    res.status(401).json({
      error: 'X-API-Key header or api_key query parameter is required.',
    })
    return
  }
  const ak = await apiKey.findByToken(token)
  if (!ak) {
    log.warn('API called with invalid API key token:', token)
    res.status(401).json({ error: 'Invalid API key token.' })
    return
  }
  res.locals.apiKey = ak
  next()
}

export async function ensureReadPermission(req, res, next) {
  if (!res.locals.apiKey || !res.locals.apiKey.canRead) {
    log.warn('Read permission denied for apiKey:', res.locals.apiKey)
    res.status(403).json({ error: 'Read permission required.' })
    return
  }
  next()
}

export async function ensureWritePermission(req, res, next) {
  if (!res.locals.apiKey || !res.locals.apiKey.canWrite) {
    log.warn('Write permission denied for apiKey:', res.locals.apiKey)
    res.status(403).json({ error: 'Write permission required.' })
    return
  }
  next()
}
