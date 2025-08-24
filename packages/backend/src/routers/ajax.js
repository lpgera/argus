import express from 'express'
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

const router = express()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (
    users.some(
      (user) => user.username === username && user.password === password
    )
  ) {
    res.json({
      token: jwt.sign({ username }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.SESSION_TIMEOUT ?? '7 days',
      }),
    })
    return
  }
  res.sendStatus(403)
})

router.use((req, res, next) => {
  const token = req.headers['x-authorization-token']
  try {
    jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (err) {
    res.sendStatus(401)
    return
  }
  next()
})

router.get('/location', async (req, res) => {
  const locations = await location.get()
  res.json(
    locations.map((l) => ({
      ...l,
      isStale: moment(l.latestCreatedAt).isBefore(
        moment().subtract(config.staleThreshold)
      ),
    }))
  )
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
  async (req, res) => {
    const { location, type, from, to, aggregation } = req.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.utc(from),
      to: moment.utc(to),
      aggregation,
    })
    res.json(
      measurements.map((item) => [
        moment(item.createdAt).startOf('minute').valueOf(),
        item.value,
      ])
    )
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
  async (req, res) => {
    const { location, type } = req.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.unix(0),
      to: moment(),
    })
    res.json(
      measurements.map((item) => [moment(item.createdAt).valueOf(), item.value])
    )
  }
)

router.get('/api-key', async (req, res) => {
  res.json(await apiKey.list())
})

router.post('/api-key', async (req, res) => {
  await apiKey.create()
  res.json(await apiKey.list())
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
  async (req, res) => {
    const { id } = req.params
    const { canRead, canWrite, comment } = req.body
    await apiKey.update(id, { canRead, canWrite, comment })
    res.json(await apiKey.list())
  }
)

router.delete(
  '/api-key/:id',
  validateParams(
    Joi.object({
      id: Joi.string().max(64).required(),
    })
  ),
  async (req, res) => {
    const { id } = req.params
    await apiKey.remove(id)
    res.json(await apiKey.list())
  }
)

router.get('/alert', async (req, res) => {
  res.json(await alert.list())
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
  async (req, res) => {
    const { location, type, comparison, value, ntfyUrl } = req.body
    await alert.create({ location, type, comparison, value, ntfyUrl })
    res.json(await alert.list())
  }
)

router.delete(
  '/alert/:id',
  validateParams(
    Joi.object({
      id: Joi.string().max(64).required(),
    })
  ),
  async (req, res) => {
    const { id } = req.params
    await alert.remove(id)
    res.json(await alert.list())
  }
)

router.get('/diagnostics', async (req, res) => {
  const locations = await diagnostics.get()
  res.json(
    locations.map((l) => ({
      ...l,
      isStale: moment(l.latestCreatedAt).isBefore(
        moment().subtract(config.staleThreshold)
      ),
    }))
  )
})

export default router
