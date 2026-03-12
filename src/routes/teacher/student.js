const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/contraller/teacher/student')

router.use('/', studentRouter.index)

module.exports = router;