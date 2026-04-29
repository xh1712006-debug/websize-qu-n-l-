const express = require('express')
const router = express.Router()
const teacherRouter = require('../../app/Api/teacher')

// router.post('/', teacherRouter.createteacher)
router.use('/', teacherRouter.index)


module.exports = router;
