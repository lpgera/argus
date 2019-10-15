const router = require('express-promise-router')()
const moment = require('moment')
const config = require('config')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const location = require('../models/location')
const measurement = require('../models/measurement')
const apiKey = require('../models/api-key')
const diagnostics = require('../models/diagnostics')
const validator = require('../validator')
const log = require('../log')
const pushBullet = require('../pushBullet')

router.use(bodyParser.json())

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const users = config.get('auth.users')
  if (
    users.some(user => user.username === username && user.password === password)
  ) {
    return res.send({
      token: jwt.sign({ username }, config.get('auth.tokenSecret'), {
        expiresIn: config.get('auth.sessionTimeoutSeconds'),
      }),
    })
  }
  res.sendStatus(403)
})

router.use((req, res, next) => {
  const token = req.header('x-authorization-token')
  try {
    jwt.verify(token, config.get('auth.tokenSecret'))
    next()
  } catch (err) {
    return res.sendStatus(401)
  }
})

router.get('/location', async (req, res) => {
  const locations = await location.get()
  const staleThreshold = config.get('location.staleThreshold')
  const locationsWithStaleFlag = locations.map(l => {
    return {
      ...l,
      isStale: moment(l.latestCreatedAt).isBefore(
        moment().subtract(staleThreshold)
      ),
    }
  })
  return res.json(locationsWithStaleFlag)
})

router.get(
  '/measurement/location/:location/type/:type/from/:from/to/:to',
  validator.validate({
    params: validator.getParamsSchema({
      location: validator.simpleString,
      type: validator.simpleString,
      from: validator.isoDateTime,
      to: validator.isoDateTime,
    }),
  }),
  async (req, res) => {
    const { location, type, from, to } = req.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.utc(from),
      to: moment.utc(to),
    })
    const resultsForHighCharts = measurements.map(item => {
      return [
        moment(item.createdAt)
          .startOf('minute')
          .valueOf(),
        item.value,
      ]
    })
    return res.json(resultsForHighCharts)
  }
)

router.get(
  '/measurement/location/:location/type/:type',
  validator.validate({
    params: validator.getParamsSchema({
      location: validator.simpleString,
      type: validator.simpleString,
    }),
  }),
  async (req, res) => {
    const { location, type } = req.params
    const measurements = await measurement.get({
      location,
      type,
      from: moment.unix(0),
      to: moment(),
    })
    const resultsForHighCharts = measurements.map(item => {
      return [moment(item.createdAt).valueOf(), item.value]
    })
    return res.json(resultsForHighCharts)
  }
)

router.get('/api-key', async (req, res) => {
  const apiKeys = await apiKey.list()
  return res.json(apiKeys)
})

router.post('/api-key', async (req, res) => {
  await apiKey.create()
  const apiKeys = await apiKey.list()
  return res.json(apiKeys)
})

router.patch(
  '/api-key/:id',
  validator.validate({
    params: validator.getParamsSchema({
      id: validator.simpleString,
    }),
    body: {
      properties: {
        canRead: {
          type: 'boolean',
        },
        canWrite: {
          type: 'boolean',
        },
        comment: {
          type: 'string',
          maxLength: 255,
        },
      },
    },
  }),
  async (req, res) => {
    const id = req.params.id
    const { canRead, canWrite, comment } = req.body
    await apiKey.update(id, { canRead, canWrite, comment })
    const apiKeys = await apiKey.list()
    return res.json(apiKeys)
  }
)

router.delete(
  '/api-key/:id',
  validator.validate({
    params: validator.getParamsSchema({
      id: validator.simpleString,
    }),
  }),
  async (req, res) => {
    const id = req.params.id
    await apiKey.remove(id)
    const apiKeys = await apiKey.list()
    return res.json(apiKeys)
  }
)

router.get('/diagnostics', async (req, res) => {
  const diagnosticsArray = await diagnostics.get()
  return res.json(diagnosticsArray)
})

router.post('/check-locations', async (req, res) => {
  const locations = await location.get()
  const staleThreshold = config.get('location.staleThreshold')
  const warningThreshold = config.get('location.warningThreshold')
  const nonStaleLocations = locations.filter(l =>
    moment(l.latestCreatedAt).isAfter(moment().subtract(staleThreshold))
  )
  const warnings = nonStaleLocations.filter(l =>
    moment(l.latestCreatedAt).isBefore(moment().subtract(warningThreshold))
  )
  await pushBullet.sendWarnings(warnings)
  res.status(204).send()
})

router.use((req, res) => {
  return res.status(404).send()
})

router.use((err, req, res, next) => {
  if (err instanceof validator.ValidationError) {
    const validationErrors = err.validationErrors
    log.warn({ validationErrors })
    return res.status(400).json({ validationErrors })
  }
  res.status(500).json({ error: err.message })
  return next(err)
})

module.exports = router
