const express = require('express')
const router = express.Router()
const chairmanController = require('../../app/contraller/teacher/chairmanController')

router.get('/dashboard', chairmanController.getDashboard)
router.get('/defense', chairmanController.getDefenseControl)
router.get('/api/students', chairmanController.getCouncilStudents)
router.post('/api/update-status', chairmanController.updateDefenseStatus)
router.post('/api/approve-final', chairmanController.approveFinal)
router.get('/schedule', chairmanController.getSchedule)

module.exports = router
