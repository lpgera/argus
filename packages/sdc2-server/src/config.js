const moment = require('moment')

module.exports = {
  staleThreshold: moment.duration(7, 'days'),
  warningThreshold: moment.duration(1, 'hour'),
}
