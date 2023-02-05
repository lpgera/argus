import moment from 'moment'
import db from '../db.js'

export async function get() {
  const start = moment().utc().subtract(1, 'day').toDate()

  const lastDayQuery = db
    .select(db.raw('location, type, count(*) as lastDayCount'))
    .from('measurement')
    .where('createdAt', '>=', start)
    .groupBy('location', 'type')
    .as('lastDay')

  const latestIdsQuery = db
    .select(db.raw('max(id)')) // using the assumption that ids are incremental, because querying by date is far slower
    .from('measurement')
    .groupBy('location', 'type')

  const results = await db
    .select(
      'measurement.location',
      'measurement.type',
      'value',
      'createdAt',
      'lastDayCount'
    )
    .from('measurement')
    .leftJoin(lastDayQuery, function () {
      this.on('lastDay.location', '=', 'measurement.location')
      this.andOn('lastDay.type', '=', 'measurement.type')
    })
    .whereIn('id', latestIdsQuery)
    .orderBy('measurement.location')
    .orderBy('measurement.type')

  return results.map((row) => {
    return {
      location: row.location,
      type: row.type,
      latestFromNow: moment(row.createdAt).fromNow(),
      latestCreatedAt: row.createdAt,
      latestValue: row.value,
      lastDayCount: row.lastDayCount || 0,
    }
  })
}
