const express = require('express')
const router = express.Router()

const microsoftRouter = require('../../app/controller/microsoft/reg')

router.get('/', microsoftRouter.index)
router.post('/', microsoftRouter.postPassword)


module.exports = router
