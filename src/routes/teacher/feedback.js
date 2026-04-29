const express = require('express')
const router = express.Router()
const feedbackRouter = require('../../app/contraller/teacher/feedback')

router.post('/postFeedback', feedbackRouter.postFeedback)
router.get('/getStudent', feedbackRouter.getStudent)
router.get('/getFeedback', feedbackRouter.getFeedback)
router.get('/', feedbackRouter.index)

module.exports = router;