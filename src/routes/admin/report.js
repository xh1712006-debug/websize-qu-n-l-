const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/controller/admin/report')

router.use('/', reportRouter.index)


module.exports = router;
