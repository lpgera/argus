import db from '../db.js'

export function get() {
  const latestIdsQuery = db
    .select(db.raw('max(id)')) // using the assumption that ids are incremental, because querying by date is far slower
    .from('measurement')
    .groupBy('location', 'type')

  return db
    .select(db.raw('location, type, createdAt as latestCreatedAt'))
    .from('measurement')
    .whereIn('id', latestIdsQuery)
    .orderBy('location')
    .orderBy('type')
}
