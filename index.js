var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const request = require('superagent')
const { handleMessageEvent, reauthenticateEvent } = require('./events')


require('dotenv').config()

app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.status(404).send('Not found!')
})

app.get('/reauthenticate', (req, res) => {
  res.sendfile(__dirname + '/reauthenticate.html')
})

app.post('/', async (req, res) => {
  let attempts = 0
  const {
    body: { challenge, event }
  } = req
  if (challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  if (event.links) {
    try {
      await handleMessageEvent(req.body)
      return res.status(200).send()
    } catch (err) {
      console.log(err.status)
      if (err.status === 404) {
        return res.status(404).send('Invalid link or inaccessable page')
      } else if (err.status === 401 && attempts < process.env.RETRIES_COUNT) {
        attempts++ 
        console.log('authToken invalid, attempting to obtain a new one. Attempt: ', attempts)
        await reauthenticateEvent()
        await handleMessageEvent(req.body)
      }
      console.log(err.message)
      return res.status(500).send()
    }
  }
})

app.get('/auth', (req, res) => {
  res.sendfile(__dirname + '/add_to_slack.html')
})

app.get('/auth/redirect', req => {
  const uri =
    'https://slack.com/api/oauth.access?code=' +
    req.query.code +
    '&client_id=' +
    process.env.CLIENT_ID +
    '&client_secret=' +
    process.env.CLIENT_SECRET +
    '&redirect_uri=' +
    process.env.REDIRECT_URI

  request
    .get(uri)
    .then(response => response)
    .catch(err => {
      console.log(err)
    })
})

app.post('/reauthenticate', async (req, res) => {
  await reauthenticateEvent()
  res.status(200).send('REQUEST RECEIVED')
})

const port = process.env.PORT || 3004

app.listen(port, () => {
  console.info(`Server is up on ${port}`)
})
