const log = require('./log')

const validateParams = schema => async (context, next) => {
  try {
    await schema.validateAsync(context.params)
  } catch (error) {
    log.warn('Validation error', JSON.stringify(error, null, 2))
    context.throw(400, error)
  }
  await next()
}

const validateRequestBody = schema => async (context, next) => {
  try {
    await schema.validateAsync(context.request.body)
  } catch (error) {
    log.warn('Validation error', JSON.stringify(error, null, 2))
    context.throw(400, error)
  }
  await next()
}

module.exports = {
  validateParams,
  validateRequestBody,
}
