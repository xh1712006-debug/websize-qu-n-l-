const express = require('express')
const router = express.Router()
const secretaryController = require('../../app/contraller/teacher/secretaryController')
const { checkSubRole } = require('../../app/middleware/auth')

// Tất cả route trong này đều yêu cầu quyền Council (gián tiếp check Secretary trong controller)
router.get('/dashboard', secretaryController.getDashboard)
router.get('/minutes', secretaryController.getMinutesPage)
router.get('/synthesis', secretaryController.getSynthesisPage)
router.get('/schedule', secretaryController.getSchedulePage)

// API
router.get('/api/students', secretaryController.getCouncilStudents)

module.exports = router
