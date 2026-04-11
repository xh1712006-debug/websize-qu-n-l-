const express = require('express')
const router = express.Router()
const dashboardRouter = require('../../app/controller/teacher/dashboard')

router.get('/', dashboardRouter.index)

module.exports = router;
