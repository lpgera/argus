const KoaRouter = require('@koa/router')
const moment = require('moment')
const _ = require('lodash')
const Joi = require('@hapi/joi')
const measurement = require('../models/measurement')
const apiAuth = require('../api-auth')
const log = require('../log')
const { validateParams, validateRequestBody } = require('../validator')

const router = new KoaRouter()

router.use(apiAuth.ensureValidApiKey)

const measurementSchema = Joi.object({
  type: Joi.string()
    .max(64)
    .required(),
  value: Joi.number().required(),
})

router.post(
  '/measurement/location/:location',
  validateParams(
    Joi.object({
      location: Joi.string()
        .max(64)
        .required(),
    })
  ),
  validateRequestBody(
    Joi.alternatives().try(
      measurementSchema,
      Joi.array()
        .items(measurementSchema)
        .min(1)
    )
  ),
  apiAuth.ensureWritePermission,
  async context => {
    const { location } = context.params
    const measurements = _.castArray(context.request.body)
    const createdAt = moment().toDate()
    log.debug('Received new measurements:', { location, measurements })

    await Promise.all(
      measurements.map(m => {
        return measurement.insert({
          createdAt,
          location,
          type: m.type,
          value: m.value,
        })
      })
    )
    context.body = null
  }
)

router.get(
  '/measurement/latest/location/:location/type/:type',
  validateParams(
    Joi.object({
      location: Joi.string()
        .max(64)
        .required(),
      type: Joi.string()
        .max(64)
        .required(),
    })
  ),
  apiAuth.ensureReadPermission,
  async context => {
    const { location, type } = context.params
    log.debug('Getting latest measurements:', { location, type })

    context.body = await measurement.getLatest({ location, type })
  }
)

module.exports = router
