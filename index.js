var express = require('express')
var app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.post('/', function (req, res) {
  console.log(req.body)
})
