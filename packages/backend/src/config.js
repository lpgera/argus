import moment from 'moment'

export default {
  staleThreshold: moment.duration(3, 'days'),
  warningThreshold: moment.duration(1, 'hour'),
}
