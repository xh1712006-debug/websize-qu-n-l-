const express = require('express')
const router = express.Router()
const dashboardRouter = require('../../app/contraller/admin/dashboard')

router.use('/', dashboardRouter.index)


module.exports = router;