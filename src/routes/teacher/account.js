const express = require('express')
const router = express.Router()
const accountRouter = require('../../app/controller/teacher/account')

router.get('/', accountRouter.index)
router.post('/update', accountRouter.update)

module.exports = router;
