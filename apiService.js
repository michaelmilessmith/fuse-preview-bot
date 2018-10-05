const request = require('superagent')

const BASE_URL = 'https://fuse.fuseuniversal.com/api/v3.1/'
const LEARNING_PLANS = 'learning_plans/'

const fetchPage = async url => {
  const res = await request.get(url).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  })
  return res
}

const postNotification = async ({ channel, ts, unfurls }) => {
  return await request
    .post('https://slack.com/api/chat.unfurl')
    .type('form')
    .send({
      token: process.env.OATH_TOKEN,
      channel,
      ts,
      unfurls
    })
}

const getLearningPlanMetadata = async ({id, url}) => {
  const { body: { learning_plan: { title, thumbnail_3x_url }}} = await request
    .get(`${BASE_URL}${LEARNING_PLANS}${id}`)
    .query({
      auth_token: process.env.FUSE_AUTH_TOKEN
    })
  return { thumbnail_3x_url, title, url }
}

module.exports = {
  fetchPage,
  postNotification,
  getLearningPlanMetadata
}
