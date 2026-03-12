const express = require('express')
const router = express.Router()
const pointRouter = require('../../app/contraller/admin/point')

router.use('/', pointRouter.index)


module.exports = router;