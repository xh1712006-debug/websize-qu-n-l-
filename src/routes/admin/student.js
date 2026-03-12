const express = require('express')
const router = express.Router()
const studentRouter = require('../../app/contraller/admin/student')

router.use('/', studentRouter.index)


module.exports = router;