// ...existing code...
const express = require('express')
const router = express.Router()
const feedbackRouter = require('../../app/controller/student/feedback')

// Use :id param so req.params.id is populated for DELETE
// router.delete('/:id', feedbackRouter.deleteFeedback)
router.post('/', feedbackRouter.createFeedback)
router.post('/message', feedbackRouter.postMessage)
router.get('/data', feedbackRouter.getFeedback)
router.get('/', feedbackRouter.index)

module.exports = router
// ...existing code...
