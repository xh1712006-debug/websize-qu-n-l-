const express = require('express')
const router = express.Router()
const { isAdmin } = require('../../app/middleware/auth')

router.use(isAdmin)

router.use('/dashboard', require('./dashboard'))
router.use('/point', require('./point'))
router.use('/project', require('./project'))
router.use('/report', require('./report'))
router.use('/student', require('./student'))
router.use('/teacher', require('./teacher'))
router.use('/config', require('./config'))
router.use('/period', require('./period'))
router.use('/archive', require('./archive'))
router.use('/logs', require('./logs'))
router.use('/account', require('./account'))



module.exports = router
