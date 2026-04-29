const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const requestController = require('../../app/contraller/teacher/request')
=======
const requestController = require('../../app/controller/teacher/request')
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26

router.get('/', requestController.index)
router.get('/approve/:id', requestController.getApproveForm)
router.post('/approve', requestController.approve)
router.post('/reject', requestController.reject)

<<<<<<< HEAD
// [NEW] Logic duyệt đủ điều kiện bảo vệ
router.get('/eligible', requestController.getEligiblePage)
router.post('/approve-eligible', requestController.approveEligible)

=======
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26
module.exports = router
