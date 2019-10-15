const apiKey = require('./models/api-key')
const log = require('./log')

async function ensureValidApiKey(req, res, next) {
  const token = req.headers['x-api-key'] || req.query['api_key']
  if (!token) {
    log.warn('API called without API key')
    return res.status(401).send({
      error: 'X-API-Key header or api_key query parameter is required.',
    })
  }
  const ak = await apiKey.findByToken(token)
  if (!ak) {
    log.warn('API called with invalid API key token:', token)
    return res.status(401).send({ error: 'Invalid API key token.' })
  }
  res.locals.apiKey = ak
  return next()
}

function ensureReadPermission(req, res, next) {
  if (!res.locals.apiKey || !res.locals.apiKey.canRead) {
    log.warn('Read permission denied for apiKey:', res.locals.apiKey)
    return res.status(403).send({ error: 'Read permission required.' })
  }
  return next()
}

function ensureWritePermission(req, res, next) {
  if (!res.locals.apiKey || !res.locals.apiKey.canWrite) {
    log.warn('Write permission denied for apiKey:', res.locals.apiKey)
    return res.status(403).send({ error: 'Write permission required.' })
  }
  return next()
}

module.exports = {
  ensureValidApiKey,
  ensureReadPermission,
  ensureWritePermission,
}
