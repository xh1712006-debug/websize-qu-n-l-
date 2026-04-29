const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const councilController = require('../../app/contraller/teacher/score')
const { checkGradeLock } = require('../../app/middleware/auth')
=======
const scoreRouter = require('../../app/controller/teacher/score')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

router.get('/', councilController.index)
router.get('/list', councilController.index) // Alias for main list
router.get('/defense', councilController.getDefensePage)
router.get('/minutes', councilController.getMinutesPage)
router.get('/grading', councilController.getGradingPage)
router.get('/getStudents', councilController.getStudents)
router.post('/submitScore', checkGradeLock, councilController.submitScore)
router.post('/submitMinutes', checkGradeLock, councilController.submitMinutes)
router.post('/synthesizeScore', checkGradeLock, councilController.synthesizeScore)
router.post('/approveFinal', checkGradeLock, councilController.approveFinal)
router.post('/updateDefenseStatus', checkGradeLock, councilController.updateDefenseStatus)
router.get('/unified-view', councilController.getUnifiedView)
router.get('/api/project-detail/:studentId', councilController.getProjectDetail)
router.get('/exportReport/:studentId', councilController.exportReport)

module.exports = router;
