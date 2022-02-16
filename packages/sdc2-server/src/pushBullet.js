const moment = require('moment')
const PushBullet = require('@jef/pushbullet')

const pusher = new PushBullet(process.env.PUSHBULLET_API_KEY)

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
