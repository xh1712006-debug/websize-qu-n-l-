const express = require('express')
const router = express.Router()
const projectRouter = require('../../app/contraller/student/project')

router.get('/', projectRouter.index)

module.exports = router;