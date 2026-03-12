const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/contraller/teacher/report')

router.use('/', reportRouter.index)

module.exports = router;