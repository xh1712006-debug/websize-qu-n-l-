const express = require('express')
const router = express.Router()
const scoreRouter = require('../../app/controller/teacher/score')

router.get('/', scoreRouter.index)
router.get('/getScore', scoreRouter.getScore)
router.post('/postScore', scoreRouter.postScore)

module.exports = router;
