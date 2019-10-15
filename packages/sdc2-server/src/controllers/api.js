const router = require('express-promise-router')()
const moment = require('moment')
const _ = require('lodash')
const bodyParser = require('body-parser')
const measurement = require('../models/measurement')
const apiAuth = require('../api-auth')
const log = require('../log')
const validator = require('../validator')

router.use(bodyParser.json())
router.use(apiAuth.ensureValidApiKey)

const measurementSchema = {
  type: 'object',
  required: ['type', 'value'],
  properties: {
    type: validator.simpleString,
    value: {
      type: 'number',
    },
  },
}

router.post(
  '/measurement/location/:location',
  validator.validate({
    params: validator.getParamsSchema({
      location: validator.simpleString,
    }),
    body: {
      anyOf: [
        measurementSchema,
        {
          type: 'array',
          items: measurementSchema,
        },
      ],
    },
  }),
  apiAuth.ensureWritePermission,
  async (req, res) => {
    const { location } = req.params
    const measurements = _.castArray(req.body)
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
    return res.status(204).send()
  }
)

router.get(
  '/measurement/latest/location/:location/type/:type',
  validator.validate({
    params: validator.getParamsSchema({
      location: validator.simpleString,
      type: validator.simpleString,
    }),
  }),
  apiAuth.ensureReadPermission,
  async (req, res) => {
    const { location, type } = req.params
    log.debug('Getting latest measurements:', { location, type })

    const latestMeasurements = await measurement.getLatest({ location, type })
    return res.status(200).json(latestMeasurements)
  }
)

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
