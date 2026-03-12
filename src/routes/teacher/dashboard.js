const express = require('express')
const router = express.Router()
const dashboardRouter = require('../../app/contraller/teacher/dashboard')

router.get('/', dashboardRouter.index)

module.exports = router;