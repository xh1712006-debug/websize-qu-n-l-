const express = require('express')
const router = express.Router()
const pointRouter = require('../../app/controller/admin/point')

router.get('/', pointRouter.index)
router.get('/getScoreFeedback', pointRouter.getScoreFeedback)
router.post('/updateScoreFeedback', pointRouter.updateScoreFeedback)


module.exports = router;
