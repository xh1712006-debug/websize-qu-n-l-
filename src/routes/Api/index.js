const express = require('express')
const router = express.Router()

// Mount API sub-routes here
router.use('/feedback', require('./feedback'))
router.use('/report', require('./report'))
router.use('/teacher', require('./teacher'))
router.use('/student', require('./student'))
router.use('/project', require('./project'))

module.exports = router