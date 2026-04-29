const express = require('express')
const router = express.Router()
const topicRouter = require('../../app/contraller/teacher/topic')

router.get('/', topicRouter.index)
router.post('/add', topicRouter.addTopic)
router.post('/delete', topicRouter.deleteTopic)

module.exports = router;
