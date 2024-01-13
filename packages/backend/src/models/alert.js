import db from '../db.js'

export function list() {
  return db.select('*').from('alert')
}

export function create({ location, type, comparison, value, ntfyUrl }) {
  return db
    .insert({
      location,
      type,
      comparison,
      value,
      ntfyUrl,
      isAlerting: false,
    })
    .into('alert')
}

export function setIsAlerting(id, isAlerting) {
  return db.table('alert').where({ id }).update({ isAlerting })
}

export function remove(id) {
  return db.table('alert').where({ id }).delete()
}
