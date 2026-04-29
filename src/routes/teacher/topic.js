const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const topicRouter = require('../../app/contraller/teacher/topic')
=======
const topicRouter = require('../../app/controller/teacher/topic')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

router.get('/', topicRouter.index)
router.post('/add', topicRouter.addTopic)
router.post('/delete', topicRouter.deleteTopic)

module.exports = router;
