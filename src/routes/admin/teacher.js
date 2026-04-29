const express = require('express')
const router = express.Router()
const teacherRouter = require('../../app/contraller/admin/teacher')

router.get('/', teacherRouter.index)
router.get('/getTeachers', teacherRouter.getTeachers)
router.post('/create', teacherRouter.createTeacher)
router.post('/update/:id', teacherRouter.updateTeacher)
router.delete('/delete/:id', teacherRouter.deleteTeacher)

module.exports = router;