const express = require('express')
const router = express.Router()
const feedbackRouter = require('../../app/Api/feedback')

// router.post('/', feedbackRouter.createFeedback)
router.use('/', feedbackRouter.index)


module.exports = router;
