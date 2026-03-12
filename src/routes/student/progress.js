const express = require('express')
const router = express.Router()
const progressRouter = require('../../app/contraller/student/progress')

router.use('/', progressRouter.index)

module.exports = router;