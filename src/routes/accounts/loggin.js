const express = require('express')
const router = express.Router()
const logginRouter = require('../../app/controller/accounts/loggin')

router.get('/', logginRouter.index)
router.post('/', logginRouter.send)
router.post('/sendTeacher', logginRouter.sendTeacher)
router.get('/logout', logginRouter.logout)

module.exports = router;
