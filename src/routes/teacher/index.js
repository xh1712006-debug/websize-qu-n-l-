const express = require('express')
const router = express.Router()

const { isTeacher, checkSubRole } = require('../../app/middleware/auth')
const leaderController = require('../../app/contraller/teacher/leader')

router.use(isTeacher) // Đảm bảo phải là giảng viên trước

router.use('/account', require('./account'))
router.use('/dashboard', require('./dashboard'))
router.use('/student', require('./student'))

// Tuyến đường dùng chung
router.use('/schedule', checkSubRole('isGVHD'), require('./schedule'))
router.get('/api/schedule-data', leaderController.getProjectsDetailed)
router.get('/projects-monitor', leaderController.getProjectsPage)
router.get('/api/projects-detailed', leaderController.getProjectsDetailed)

// Phân quyền chi tiết theo subRoles
router.use('/request', checkSubRole('isGVHD'), require('./request'))
router.use('/report', checkSubRole('isGVHD'), require('./report'))
router.use('/feedback', checkSubRole('isGVHD'), require('./feedback'))

router.use('/council', checkSubRole('isCouncil'), require('./score'))
router.use('/secretary', checkSubRole('isCouncil'), require('./secretary'))
router.use('/chairman', checkSubRole('isCouncil'), require('./chairman'))
router.use('/member', checkSubRole('isCouncil'), require('./member'))
router.use('/review', checkSubRole('isGVPB'), require('./review'))

// Leader chuyên ngành
router.use('/leader', checkSubRole('isLeader'), require('./leader'))

module.exports = router;