const express = require('express')
const router = express.Router()


router.use('/singger', require('./singger'))

module.exports = router