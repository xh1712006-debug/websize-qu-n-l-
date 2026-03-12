const express = require('express')
const router = express.Router()

router.use('/account', require('./account'))
router.use('/dashboard', require('./dashboard'))
router.use('/feedback', require('./feedback'))
router.use('/project', require('./project'))
router.use('/report', require('./report'))
router.use('/student', require('./student'))

module.exports = router;