const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/controller/admin/student')

router.get('/', studentRouter.index)
<<<<<<< HEAD
router.get('/getStudents', studentRouter.getStudents)
router.post('/update/:id', studentRouter.updateStudent)
=======
router.get('/getStudent', studentRouter.getStudent)
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
router.delete('/delete/:id', studentRouter.deleteStudent)


module.exports = router;
