import KoaRouter from '@koa/router'
import moment from 'moment'
import Joi from 'joi'
import * as measurement from '../models/measurement.js'
import * as apiAuth from '../api-auth.js'
import log from '../log.js'
import { validateParams, validateRequestBody } from '../validator.js'

const router = new KoaRouter()

router.use(apiAuth.ensureValidApiKey)

const measurementSchema = Joi.object({
  type: Joi.string().max(64).required(),
  value: Joi.number().required(),
})

router.post(
  '/measurement/location/:location',
  validateParams(
    Joi.object({
      location: Joi.string().max(64).required(),
    })
  ),
  validateRequestBody(
    Joi.alternatives().try(
      measurementSchema,
      Joi.array().items(measurementSchema).min(1)
    )
  ),
  apiAuth.ensureWritePermission,
  async (context) => {
    const { location } = context.params
    const measurements = Array.isArray(context.request.body)
      ? context.request.body
      : [context.request.body]
    const createdAt = moment().toDate()
    log.debug({ location, measurements }, 'Received new measurements.')

    await Promise.all(
      measurements.map((m) => {
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
      location: Joi.string().max(64).required(),
      type: Joi.string().max(64).required(),
    })
  ),
  apiAuth.ensureReadPermission,
  async (context) => {
    const { location, type } = context.params
    log.debug({ location, type }, 'Getting latest measurements.')

    context.body = await measurement.getLatest({ location, type })
  }
)

export default router
