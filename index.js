var express = require('express')
var app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.post('/', function (req, res) {
  console.log(req.body)
  if(req.body.challenge) {
    res.status(200).send(req.body.challenge)
    return
  }
  res.status(200).send()
})

const port = process.env.PORT || 3004;

app.listen(port, () => {
    console.info(`Server is up on ${port}`);
});
