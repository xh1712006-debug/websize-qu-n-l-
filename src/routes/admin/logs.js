const express = require('express')
const router = express.Router()
const configController = require('../../app/contraller/admin/config')

router.get('/', configController.viewLogs)

module.exports = router
