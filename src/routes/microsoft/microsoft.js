const express = require('express')
const router = express.Router()

const microsoftRouter = require('../../app/controller/microsoft/test')

router.get('/', microsoftRouter.index)

router.get('/callback', microsoftRouter.callback)


module.exports = router
