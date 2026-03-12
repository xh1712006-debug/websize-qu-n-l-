const express = require('express')
const router = express.Router()



router.use('/dashboard', require('./dashboard'))
router.use('/point', require('./point'))
router.use('/project', require('./project'))
router.use('/report', require('./report'))
router.use('/student', require('./student'))
router.use('/teacher', require('./teacher'))



module.exports = router