const express = require('express')
const router = express.Router()
const accountRouter = require('../../app/contraller/teacher/account')

router.use('/', accountRouter.index)

module.exports = router;