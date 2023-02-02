import moment from 'moment'
import db from '../db.js'

export function list() {
  return db.select('*').from('alert')
}

export function create({ location, type, comparison, value }) {
  return db
    .insert({
      createdAt: moment().toDate(),
      location,
      type,
      comparison,
      value,
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

export function findByLocationAndType({ location, type }) {
  return db.select('*').from('alert').where({ location, type }).first()
}
