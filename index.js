var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const request = require('superagent')

const { fetchPage, postNotification } = require('./apiService')
const { createMetadata } = require('./metadataService')

require('dotenv').config()

app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.status(404).send('Not found!')
})

app.post('/', async (req, res) => {
  const { body : { 
    challenge, 
    event
  }} = req
  if (challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  if (event.links) {
    try {
      const {
        event: { channel, links, message_ts: ts }
      } = req.body
      const { url } = links[0]
      const page = await fetchPage(url)
      
      const unfurls = await createMetadata({ page, url })
      await postNotification({ channel, ts, unfurls })
      return res.status(200).send()
    } catch (err) {
      console.log(err)
      if (err.status === 404) return res.status(404).send('Invalid link or inaccessable page')
      return res.status(500).send(err)
    }
  }
})

app.get('/auth', (req, res) => {
  res.sendFile(__dirname + '/add_to_slack.html')
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

const port = process.env.PORT || 3004

app.listen(port, () => {
  console.info(`Server is up on ${port}`)
})
