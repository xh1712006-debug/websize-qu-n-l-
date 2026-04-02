const express = require('express')
const router = express.Router()
const projectRouter = require('../../app/contraller/student/score')

router.get('/', projectRouter.index)

module.exports = router;