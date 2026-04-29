const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/contraller/admin/student')

router.get('/', studentRouter.index)
router.get('/getStudents', studentRouter.getStudents)
router.post('/update/:id', studentRouter.updateStudent)
router.delete('/delete/:id', studentRouter.deleteStudent)


module.exports = router;