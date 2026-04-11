const express = require('express')
const router = express.Router()

router.use('/account', require('./account'))
router.use('/dashboard', require('./dashboard'))
router.use('/feedback', require('./feedback'))
router.use('/request', require('./request'))
router.use('/report', require('./report'))
router.use('/student', require('./student'))
router.use('/score', require('./score'))
router.use('/scoreFeedback', require('./scoreFeedback'))

module.exports = router;
