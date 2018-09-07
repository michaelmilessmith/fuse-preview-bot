var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const request = require('superagent')

app.use(bodyParser.json())

app.post('/', function(req, res) {
  console.log(req.body)
  if (req.body.challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  if (req.body.event.links) {
    console.log(req.body.event.links)
    const { token, event: { channel, links, message_ts: ts } } = req.body
    request
      .post('https://slack.com/api/chat.unfurl')
      .type('form')
      .send({
        token: "xoxp-4672449302-328494600469-430933377587-a4114c36cc41e5d210366310ffb8061d",
        channel,
        ts,
        unfurls: {
          'https://fuse.fuseuniversal.com/': {
            text: 'Every day is the test.'
          }
        },
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
