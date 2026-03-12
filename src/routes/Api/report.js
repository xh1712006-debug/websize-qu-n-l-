const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/Api/report')

// router.post('/', reportRouter.createreport)
router.use('/', reportRouter.index)


module.exports = router;