const express = require('express')
const router = express.Router()
const scoreFeedbackRouter = require('../../app/contraller/teacher/scoreFeedback')
const { checkGradeLock } = require('../../app/middleware/auth')

router.get('/', scoreFeedbackRouter.index)
router.get('/getScoreFeedback', scoreFeedbackRouter.getScoreFeedback)
router.post('/postScoreFeedback', checkGradeLock, scoreFeedbackRouter.postScoreFeedback)


module.exports = router;