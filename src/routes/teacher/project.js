const express = require('express')
const router = express.Router()
const projectRouter = require('../../app/controller/teacher/project')

router.use('/', projectRouter.index)

module.exports = router;
