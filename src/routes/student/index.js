const express = require('express')
const router = express.Router()


router.use('/project', require('./project'))
router.use('/feedback', require('./feedback'))
router.use('/progress', require('./progress'))
router.use('/report', require('./report'))
router.use('/dashboard', require('./dashboard'))
router.use('/account', require('./account'))
router.use('/score', require('./score'))


module.exports = router