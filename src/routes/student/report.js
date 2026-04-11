// filepath: d:\hoc_html\on_html\project2\src\routes\student\report.js
const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/controller/student/report')


router.get('/', reportRouter.controller.index)
router.get('/getReport', reportRouter.controller.getReport)
router.get('/upload/file/:fileUrl', reportRouter.controller.downloadFile)
router.post('/upload', reportRouter.upload.single('file_url'),reportRouter.controller.newReport) 
// router.post('/new-report', reportRouter.controller.newReport)  


module.exports = router
