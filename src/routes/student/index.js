const express = require('express')
const router = express.Router()
const contentStudent = require('../../app/models/student')
const auth = require('../../app/middleware/auth')

// Áp dụng isStudent middleware cho toàn bộ student routes
// Middleware này sẽ: kiểm tra session, query DB, set userRole/userObj/user/hasProject
router.use(auth.isStudent)

router.use('/project', require('./project'))
router.use('/addproject', require('./addproject'))
router.use('/feedback', require('./feedback'))
router.use('/report', require('./report'))
router.use('/dashboard', require('./dashboard'))
router.use('/account', require('./account'))
router.use('/score', require('./score'))
const leaderController = require('../../app/contraller/teacher/leader')
router.get('/schedule', leaderController.getSchedulePage)
router.get('/api/schedule-data', leaderController.getProjectsDetailed)


module.exports = router