var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const request = require('superagent')
require('dotenv').config()

app.use(bodyParser.json())

app.get('/', function(req, res) {
    const url = `https://fuse.fuseuniversal.com/communities/908/contents/168364`
    const unfurls = JSON.stringify({
      [url]: {
        text: 'Every day is the test.'
      }
    })
    console.log(unfurls)
    request
      .post('https://slack.com/api/chat.unfurl')
      .type('form')
      .send({
        token: process.env.OATH_TOKEN,
        channel: "D9NA5EYBE",
        ts: "1536314513.000100",
        unfurls,
        // user_auth_required: true
      })
      .then(res => console.log(res.body))
  res.status(200).send()
})

app.post('/', function(req, res) {
  console.log(req.body)
  if (req.body.challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  if (req.body.event.links) {
    console.log(req.body.event.links)
    const { token, event: { channel, links, message_ts: ts } } = req.body
    const { url } = links[0]
    const unfurls = JSON.stringify({
      [url]: {
        text: 'Every day is the test.'
      }
    })
    console.log(unfurls)
    request
      .post('https://slack.com/api/chat.unfurl')
      .type('form')
      .send({
        token: process.env.OATH_TOKEN,
        channel,
        ts,
        unfurls,
        // user_auth_required: true
      })
      .then(res => console.log(res.body))
  }
  res.status(200).send()
})

const port = process.env.PORT || 3004

app.listen(port, () => {
  console.info(`Server is up on ${port}`)
})
