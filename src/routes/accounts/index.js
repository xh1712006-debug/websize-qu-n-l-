const express = require('express')
const router = express.Router()


router.use('/loggin', require('./loggin'))

module.exports = router
