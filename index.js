var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const request = require('superagent')
const { getMetadata } = require('page-metadata-parser')
const domino = require('domino')
require('dotenv').config()

app.use(bodyParser.json())

app.get('/', function(req, res) {
  const url = `https://fuse.fuseuniversal.com/communities/908/contents/168364`
  const unfurls = JSON.stringify({
    [url]: {
      text: 'Every day is the test.'
    }
  })
  request
    .post('https://slack.com/api/chat.unfurl')
    .type('form')
    .send({
      token: process.env.OATH_TOKEN,
      channel: 'D9NA5EYBE',
      ts: '1536314513.000100',
      unfurls
      // user_auth_required: true
    })
    .then(res => console.log(res.body))
  res.status(200).send()
})

app.post('/', function(req, res) {
  if (req.body.challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  if (req.body.event.links) {
    const {
      event: { channel, links, message_ts: ts }
    } = req.body
    const { url } = links[0]

    request
      .get(url)
      .query({
        auth_token: process.env.FUSE_AUTH_TOKEN
      })
      .then(res => {
        const doc = domino.createWindow(res.text).document
        const metadata = getMetadata(doc, url)
        const { title, description: text, image: image_url, icon: footer_icon} = metadata
        const unfurls = JSON.stringify({
          [url]: {
            text, 
            image_url, 
            title, 
            fallback: title, 
            footer_icon,
            footer: 'Powered by Fuse Universal'
          }
        })
        request
          .post('https://slack.com/api/chat.unfurl')
          .type('form')
          .send({
            token: process.env.OATH_TOKEN,
            channel,
            ts,
            unfurls
          })
          .then(res => res.body)
      })
      .catch((err) => console.log(err && err.status))
    res.status(200).send()
  }
})

app.get('/auth', (req, res) => {
  res.sendFile(__dirname + '/add_to_slack.html')
})

app.get('/auth/redirect', (req, res) => {
  var uri =
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
