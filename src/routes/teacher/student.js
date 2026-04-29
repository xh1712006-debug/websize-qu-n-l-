const express = require('express')
const router = express.Router()
const studentController = require('../../app/contraller/teacher/student')

router.get('/', studentController.index)


module.exports = router;