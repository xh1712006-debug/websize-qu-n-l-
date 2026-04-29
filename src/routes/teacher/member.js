const express = require('express')
const router = express.Router()
const memberController = require('../../app/contraller/teacher/memberController')
const scoreController = require('../../app/contraller/teacher/score')

router.get('/dashboard', memberController.getDashboard)
router.get('/schedule', memberController.getSchedule)

module.exports = router
