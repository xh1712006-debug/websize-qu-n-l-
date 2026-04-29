const express = require('express')
const router = express.Router()
const progressRouter = require('../../app/controller/student/progress')

router.get('/', progressRouter.index)
router.get('/getProgress', progressRouter.getProgress)

module.exports = router;
