const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/Api/student')

// router.post('/', studentRouter.createstudent)
router.use('/', studentRouter.index)


module.exports = router;