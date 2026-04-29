const express = require('express')
const router = express.Router()
const pointRouter = require('../../app/controller/admin/point')

router.get('/', pointRouter.index)
router.get('/getScoreFeedback', pointRouter.getScoreFeedback)
router.post('/updateScoreFeedback', pointRouter.updateScoreFeedback)
router.get('/api/pending-submissions', pointRouter.getPendingSubmissions)
router.post('/api/approve-submission', pointRouter.approveSubmission)
router.post('/api/reject-submission', pointRouter.rejectSubmission)
router.post('/api/publish', pointRouter.publishGrades)
router.get('/api/detail/:id', pointRouter.getGradeDetail)


module.exports = router;
