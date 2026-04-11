const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/controller/teacher/student')

router.use('/', studentRouter.index)

module.exports = router;
