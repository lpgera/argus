import log from './log.js'

export const validateParams = (schema) => async (context, next) => {
  try {
    await schema.validateAsync(context.params)
  } catch (error) {
    log.warn(error, 'Validation error.')
    context.throw(400, error)
  }
  await next()
}

export const validateRequestBody = (schema) => async (context, next) => {
  try {
    await schema.validateAsync(context.request.body)
  } catch (error) {
    log.warn(error, 'Validation error.')
    context.throw(400, error)
  }
  await next()
}
