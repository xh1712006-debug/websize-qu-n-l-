const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/controller/admin/student')

router.get('/', studentRouter.index)
router.get('/getStudent', studentRouter.getStudent)
router.delete('/delete/:id', studentRouter.deleteStudent)


module.exports = router;
