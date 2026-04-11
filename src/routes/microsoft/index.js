const express = require('express')
const router = express.Router()

router.use('/microsoft', require('./microsoft'))
router.use('/reg', require('./reg'))


module.exports = router
