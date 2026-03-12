const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/contraller/admin/report')

router.use('/', reportRouter.index)


module.exports = router;