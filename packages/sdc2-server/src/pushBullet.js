const config = require('config')
const moment = require('moment')
const PushBullet = require('@jef/pushbullet')

const pusher = new PushBullet(config.get('pushBullet.apiKey'))

async function sendWarnings(locations) {
  if (!locations.length) {
    return
  }
  const message = locations
    .map(
      (l) =>
        `${l.location} ${l.type} ${moment(l.latestCreatedAt).toISOString()}`
    )
    .join('\n')
  await pusher.note('', 'SDC warning', message)
}

module.exports = {
  sendWarnings,
}
