const request = require('superagent')

const BASE_URL = 'https://fuse.fuseuniversal.com/api/v3.1/'
const LEARNING_PLANS = 'learning_plans/'
const EVENTS = 'events/'
const TOPICS = 'topics/'

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

const getLearningPlanMetadata = async ({ id }) => {
  const {
    body: {
      learning_plan: { title, thumbnail_3x_url }
    }
  } = await request.get(`${BASE_URL}${LEARNING_PLANS}${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  })
  return { image_url: thumbnail_3x_url, title }
}

const getEventMetadata = async ({ id }) => {
  const {
    body: { name, asset_url, description }
  } = await request.get(`${BASE_URL}${EVENTS}${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  })
  return { name, asset_url, description }
}

const getTopicMetadata = async ({ id }) => {
  const {
    body: { name, image_url, description }
  } = await request.get(`${BASE_URL}${TOPICS}${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  })
  return { title: name, image_url, description }
}



module.exports = {
  fetchPage,
  postNotification,
  getLearningPlanMetadata,
  getEventMetadata, 
  getTopicMetadata
}
