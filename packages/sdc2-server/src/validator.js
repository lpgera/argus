const {
  Validator,
  ValidationError,
} = require('express-json-validator-middleware')

const validator = new Validator({ allErrors: true })
const validate = validator.validate

function getParamsSchema(rules) {
  return {
    type: 'object',
    properties: rules,
  }
}

const simpleString = {
  type: 'string',
  pattern: '^[a-zA-z0-9_\\-]+$',
}

const isoDateTime = {
  type: 'string',
  format: 'date-time',
}

module.exports = {
  validate,
  getParamsSchema,
  simpleString,
  isoDateTime,
  ValidationError,
}
