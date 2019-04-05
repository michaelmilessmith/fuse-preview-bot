const request = require('superagent');
const FormData = require('form-data');

const BASE_URL = 'https://fuse.fuseuniversal.com/api/v3.1/';
const LEARNING_PLANS = 'learning_plans';
const EVENTS = 'events/';
const TOPICS = 'topics/';
const TOKEN = 'token';
const SLACKBOT = 'slackbot';
const CONTENTS = 'contents';
const QUESTION = 'question';
const NOTIFICATIONS = 'notifications';
const LEARNING_PLANS_REQUEST = 'learning-plans'

const fetchPage = async (url) => {
  try {
    const res = await request.get(url).query({
      auth_token: process.env.FUSE_AUTH_TOKEN
    });
    return res;
  } catch (err) {
    throw err;
  }
};

const postNotification = async ({ channel, ts, unfurls }) => {
  return await request
    .post('https://slack.com/api/chat.unfurl')
    .type('form')
    .send({
      token: process.env.OATH_TOKEN,
      channel,
      ts,
      unfurls
    });
};

const getLearningPlanMetadata = async ({ id }) => {
  const {
    body: {
      learning_plan: { title, thumbnail_url }
    }
  } = await request.get(`${BASE_URL}${LEARNING_PLANS}/${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  });
  return { image_url: thumbnail_url, title };
};

const getEventMetadata = async ({ id }) => {
  const {
    body: { name, asset_url, description }
  } = await request.get(`${BASE_URL}${EVENTS}${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  });
  return { name, asset_url, description };
};

const getTopicMetadata = async ({ id }) => {
  const {
    body: { name, image_url, description }
  } = await request.get(`${BASE_URL}${TOPICS}${id}`).query({
    auth_token: process.env.FUSE_AUTH_TOKEN
  });
  return { title: name, image_url, description };
};

const authenticate = async () => {
  const { body } = await request
    .post(`${BASE_URL}${TOKEN}`)
    .type('form')
    .send({
      login_name: SLACKBOT,
      password: process.env.SLACKBOT_PASSWORD
    });
  return body;
};

const submitQuestion = async (data) => {
  const res = await request
    .post(`${process.env.FUSE_API_URL}/${CONTENTS}/${QUESTION}`)
    .query({ auth_token: process.env.USER_AUTH_TOKEN })
    .field('name', data.question)
    .field('description', 'This was asked using the Fuse Slack Bot')
    .field('community_ids', '3');
  return res;
};

const getNotifications = async () => {
  const res = await request
    .get(`${process.env.FUSE_API_URL}/${NOTIFICATIONS}/latest`)
    .query({ auth_token: process.env.USER_AUTH_TOKEN });
  return res;
};

const getLearningPlans = async () => {
  const res = await request
    .get(`${process.env.FUSE_API_URL}/${LEARNING_PLANS_REQUEST}/my`)
    .query({ auth_token: process.env.USER_AUTH_TOKEN });
  return res;
};

postDelayedResponse = async (responseUrl, data) => {
  const res = await request.post(responseUrl).send(data);
  return res;
};

module.exports = {
  fetchPage,
  postNotification,
  getLearningPlanMetadata,
  getEventMetadata,
  getTopicMetadata,
  authenticate,
  submitQuestion,
  getNotifications,
  getLearningPlans,
  postDelayedResponse
};
