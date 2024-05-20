import KoaRouter from '@koa/router'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import * as location from '../models/location.js'
import * as measurement from '../models/measurement.js'
import * as apiKey from '../models/api-key.js'
import * as diagnostics from '../models/diagnostics.js'
import * as alert from '../models/alert.js'
import { validateParams, validateRequestBody } from '../validator.js'
import config from '../config.js'

const users = process.env.USERS.split(',').reduce((acc, current) => {
  if (!current) {
    return acc
  }
  const [username, password] = current.split(':')
  return [...acc, { username, password }]
}, [])

const router = new KoaRouter()

router.post('/login', (context) => {
  const { username, password } = context.request.body
  if (
    users.some(
      (user) => user.username === username && user.password === password
    )
  ) {
    context.body = {
      token: jwt.sign({ username }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.SESSION_TIMEOUT ?? '7 days',
      }),
    }
    return
  }
  context.status = 403
})

router.use(async (context, next) => {
  const token = context.headers['x-authorization-token']
  try {
    jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (err) {
    context.status = 401
    return
  }
  await next()
})

router.get('/location', async (context) => {
  const locations = await location.get()
  context.body = locations.map((l) => {
    return {
      ...l,
      isStale: moment(l.latestCreatedAt).isBefore(
        moment().subtract(config.staleThreshold)
      ),
    }
  })
})

router.get(
  '/measurement/location/:location/type/:type/from/:from/to/:to/aggregation/:aggregation',
  validateParams(
    Joi.object({
      location: Joi.string().max(64).required(),
      type: Joi.string().max(64).required(),
      from: Joi.string().isoDate().required(),
      to: Joi.string().isoDate().required(),
      aggregation: Joi.string()
        .valid('average', 'minimum', 'maximum', 'count', 'sum')
        .required(),
    })
  ),
  async (context) => {
    const { location, type, from, to, aggregation } = context.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.utc(from),
      to: moment.utc(to),
      aggregation,
    })
    context.body = measurements.map((item) => {
      return [moment(item.createdAt).startOf('minute').valueOf(), item.value]
    })
  }
)

router.get(
  '/measurement/location/:location/type/:type',
  validateParams(
    Joi.object({
      location: Joi.string().max(64).required(),
      type: Joi.string().max(64).required(),
    })
  ),
  async (context) => {
    const { location, type } = context.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.unix(0),
      to: moment(),
    })
    context.body = measurements.map((item) => {
      return [moment(item.createdAt).valueOf(), item.value]
    })
  }
)

router.get('/api-key', async (context) => {
  context.body = await apiKey.list()
})

router.post('/api-key', async (context) => {
  await apiKey.create()
  context.body = await apiKey.list()
})

router.patch(
  '/api-key/:id',
  validateParams(
    Joi.object({
      id: Joi.string().max(64).required(),
    })
  ),
  validateRequestBody(
    Joi.object({
      canRead: Joi.boolean(),
      canWrite: Joi.boolean(),
      comment: Joi.string().allow('').max(255),
    })
  ),
  async (context) => {
    const { id } = context.params
    const { canRead, canWrite, comment } = context.request.body
    await apiKey.update(id, { canRead, canWrite, comment })
    context.body = await apiKey.list()
  }
)

router.delete(
  '/api-key/:id',
  validateParams(
    Joi.object({
      id: Joi.string().max(64).required(),
    })
  ),
  async (context) => {
    const { id } = context.params
    await apiKey.remove(id)
    context.body = await apiKey.list()
  }
)

router.get('/alert', async (context) => {
  context.body = await alert.list()
})

router.post(
  '/alert',
  validateRequestBody(
    Joi.object({
      location: Joi.string().max(64).required(),
      type: Joi.string().max(64).required(),
      comparison: Joi.string().valid('<', '<=', '=', '>=', '>').required(),
      value: Joi.number().required(),
      ntfyUrl: Joi.string()
        .uri({
          scheme: ['http', 'https'],
        })
        .required(),
    })
  ),
  async (context) => {
    const { location, type, comparison, value, ntfyUrl } = context.request.body
    await alert.create({ location, type, comparison, value, ntfyUrl })
    context.body = await alert.list()
  }
)

router.delete(
  '/alert/:id',
  validateParams(
    Joi.object({
      id: Joi.string().max(64).required(),
    })
  ),
  async (context) => {
    const { id } = context.params
    await alert.remove(id)
    context.body = await alert.list()
  }
)

router.get('/diagnostics', async (context) => {
  const locations = await diagnostics.get()
  context.body = locations.map((l) => {
    return {
      ...l,
      isStale: moment(l.latestCreatedAt).isBefore(
        moment().subtract(config.staleThreshold)
      ),
    }
  })
})

export default router
