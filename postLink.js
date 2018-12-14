const request = require('superagent')
const { fetchPage } = require('./apiService')
const { checkMetadata } = require('./metadataService')
require('dotenv').config()


const urlConfig = {
  'MOBILE_DEV': process.env.SLACK_WEBHOOK_GUILD_MOBILE_DEV_URL,
  'WEB_DEV': process.env.SLACK_WEBHOOK_GUILD_WEB_DEV_URL,
  'FRONTEND': process.env.SLACK_WEBHOOK_FRONTEND_URL
}

const postLink = async (req, res) => {
  const { url: text, channel } = req.body

  const page = await fetchPage(text)
  const metaData = await (checkMetadata({ page, url: text }))
  const message = JSON.stringify({
    attachments: [
      {
        title: metaData.title,
        title_link: text, 
        text: `${metaData.text||''}`,
        footer: 'Powered by Fuse Universal', 
        username: 'slack-preview-bot',
        fallback: metaData.title,
        footer_icon: metaData.footer_icon,
        image_url: metaData.image_url
      }
    ]
  })
  const url = urlConfig[channel]
  await request
    .post(url)
    .send(message)
  res.status(200).send('Coolio.')
}

module.exports = postLink
