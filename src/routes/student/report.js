// filepath: d:\hoc_html\on_html\project2\src\routes\student\report.js
const express = require('express')
const router = express.Router()
const reportRouter = require('../../app/contraller/student/report')

router.get('/', reportRouter.controller.index)
router.get('/getReport', reportRouter.controller.getReport)

router.post('/upload', reportRouter.upload.single('file_url')) 
router.post('/new-report', reportRouter.controller.newReport)  

module.exports = router