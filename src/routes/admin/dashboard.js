const express = require('express')
const router = express.Router()
const dashboardRouter = require('../../app/controller/admin/dashboard')

router.use('/', dashboardRouter.index)


module.exports = router;
