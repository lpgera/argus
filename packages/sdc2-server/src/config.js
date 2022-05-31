import moment from 'moment'

export default {
  staleThreshold: moment.duration(7, 'days'),
  warningThreshold: moment.duration(1, 'hour'),
}
