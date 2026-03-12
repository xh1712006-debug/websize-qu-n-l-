const express = require('express')
const router = express.Router()
const singgerRouter = require('../../app/contraller/accounts/singger')

router.get('/', singgerRouter.index)
router.post('/', singgerRouter.send)
router.post('/sendTeacher', singgerRouter.sendTeacher)

module.exports = router;