const express = require('express')
const router = express.Router()
const requestController = require('../../app/controller/teacher/request')

router.get('/', requestController.index)
router.get('/approve/:id', requestController.getApproveForm)
router.post('/approve', requestController.approve)
router.post('/reject', requestController.reject)

module.exports = router
