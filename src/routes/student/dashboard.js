const express = require('express')
const router = express.Router()
const dashboardRouter = require('../../app/controller/student/dashboard')

router.get('/', dashboardRouter.index)
router.post('/selectProject', dashboardRouter.selectProject)


module.exports = router;
