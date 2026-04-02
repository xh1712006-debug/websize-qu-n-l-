const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/contraller/teacher/report')

// router.post('/postReport', reportRouter.postReport)
router.get('/getRequirement', reportRouter.getRequirement)
router.post('/postRequirement', reportRouter.postRequirement)
router.post('/postRemove', reportRouter.postRemove)
router.get('/getReport', reportRouter.getReport)
router.get('/viewFile/:fileUrl', reportRouter.viewFile)
router.get('/', reportRouter.index)

module.exports = router;