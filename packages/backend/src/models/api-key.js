import { randomUUID } from 'crypto'
import db from '../db.js'

export function list() {
  return db.select('*').from('apiKey')
}

export function create() {
  const token = randomUUID()
  const canRead = false
  const canWrite = false
  const comment = ''
  return db.insert({ token, canRead, canWrite, comment }).into('apiKey')
}

export function update(id, { canRead, canWrite, comment }) {
  return db.table('apiKey').where({ id }).update({ canRead, canWrite, comment })
}

export function remove(id) {
  return db.table('apiKey').where({ id }).delete()
}

export function findByToken(token) {
  return db.select('*').from('apiKey').where({ token }).first()
}
