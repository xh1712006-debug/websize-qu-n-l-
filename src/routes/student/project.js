const express = require('express')
const router = express.Router()
const projectRouter = require('../../app/controller/student/project')

router.get('/', projectRouter.index)
router.get('/getProject', projectRouter.getProject)

module.exports = router;
