const express = require('express')
const router = express.Router()
const teacherRouter = require('../../app/contraller/admin/teacher')

router.get('/', teacherRouter.index)
router.get('/addTeacher', teacherRouter.addTeacher)
router.post('/addTeacher', teacherRouter.postAddTeacher)


module.exports = router;