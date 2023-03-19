import db from '../../src/db.js'

export default async function upsertDailyAggregations() {
  await db.raw(`
    replace into dailyAggregation (measurementDay, location, type, count, sum, average, minimum, maximum)
    select
      DATE_FORMAT(createdAt, '%Y-%m-%d 00:00:00') as measurementDay,
      location,
      type,
      count(value)                                as count,
      sum(value)                                  as sum,
      avg(value)                                  as average,
      min(value)                                  as minimum,
      max(value)                                  as maximum
    from measurement
    group by measurementDay, location, type
    order by measurementDay;
  `)
}
