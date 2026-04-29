const express = require('express')
const router = express.Router()
const requestController = require('../../app/contraller/teacher/request')

router.get('/', requestController.index)
router.get('/approve/:id', requestController.getApproveForm)
router.post('/approve', requestController.approve)
router.post('/reject', requestController.reject)

// [NEW] Logic duyệt đủ điều kiện bảo vệ
router.get('/eligible', requestController.getEligiblePage)
router.post('/approve-eligible', requestController.approveEligible)

module.exports = router
