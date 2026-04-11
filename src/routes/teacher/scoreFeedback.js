const express = require('express')
const router = express.Router()
const scoreFeedbackRouter = require('../../app/controller/teacher/scoreFeedback')

router.get('/', scoreFeedbackRouter.index)
router.get('/getScoreFeedback', scoreFeedbackRouter.getScoreFeedback)
router.post('/postScoreFeedback', scoreFeedbackRouter.postScoreFeedback)


module.exports = router;
