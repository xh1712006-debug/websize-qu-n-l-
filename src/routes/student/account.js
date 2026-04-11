const express = require('express')
const router = express.Router()
const accountRouter = require('../../app/controller/student/account')

router.get('/', accountRouter.index)
router.get('/data', accountRouter.getAccount)
router.patch('/data', accountRouter.upAccount)

module.exports = router;
