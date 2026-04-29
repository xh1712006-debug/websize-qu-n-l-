const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const scoreFeedbackRouter = require('../../app/contraller/teacher/scoreFeedback')
const { checkGradeLock } = require('../../app/middleware/auth')
=======
const scoreFeedbackRouter = require('../../app/controller/teacher/scoreFeedback')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

router.get('/', scoreFeedbackRouter.index)
router.get('/getScoreFeedback', scoreFeedbackRouter.getScoreFeedback)
router.post('/postScoreFeedback', checkGradeLock, scoreFeedbackRouter.postScoreFeedback)


module.exports = router;
