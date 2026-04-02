const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/contraller/admin/student')

router.get('/', studentRouter.index)
router.get('/getStudent', studentRouter.getStudent)


module.exports = router;