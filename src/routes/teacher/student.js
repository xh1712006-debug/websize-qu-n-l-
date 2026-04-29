const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const studentController = require('../../app/contraller/teacher/student')

router.get('/', studentController.index)
=======
const studentRouter = require('../../app/controller/teacher/student')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26


module.exports = router;
