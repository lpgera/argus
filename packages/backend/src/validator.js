import log from './log.js'

export const validateParams = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.params)
    next()
  } catch (error) {
    log.warn(error, 'Validation error.')
    res.status(400).json({ error: error.message })
  }
}

export const validateRequestBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body)
    next()
  } catch (error) {
    log.warn(error, 'Validation error.')
    res.status(400).json({ error: error.message })
  }
}
