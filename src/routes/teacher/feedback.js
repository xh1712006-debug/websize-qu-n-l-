const express = require('express')
const router = express.Router()
const feedbackRouter = require('../../app/controller/teacher/feedback')

router.post('/postFeedback', feedbackRouter.postFeedback)
router.get('/getStudent', feedbackRouter.getStudent)
router.get('/getFeedback', feedbackRouter.getFeedback)
router.get('/getFeedbackStudent', feedbackRouter.getFeedbackStudent)
router.get('/', feedbackRouter.index)

module.exports = router;
