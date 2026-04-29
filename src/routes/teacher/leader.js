const express = require('express')
const router = express.Router()
const leaderController = require('../../app/contraller/teacher/leader')
const leaderDashboardController = require('../../app/contraller/teacher/leaderDashboardController')

/**
 * MAJOR HEAD (LĐBM) COMMAND SUITE
 */

// --- 0. DASHBOARD & STATS ---
router.get('/', leaderDashboardController.index)
router.get('/api/stats', leaderDashboardController.getDashboardStats)

// --- 1. MONITORING (QUẢN LÝ & GIÁM SÁT) ---
router.get('/projects', leaderController.getProjectsPage)
router.get('/api/projects-detailed', leaderController.getProjectsDetailed)
router.get('/grading', leaderController.getGradingPage)
router.get('/getStudentProjects', leaderController.getStudentProjects) // Legacy support
router.post('/assignSupervisor', leaderController.assignSupervisor)
router.post('/approveTopic', leaderController.approveTopicByLeader)
router.get('/api/teachers-slots', leaderController.getTeachersWithSlots)
router.post('/api/direct-register', leaderController.directRegister)

// --- 2. COUNCILS (THÀNH LẬP HỘI ĐỒNG) ---
router.get('/councils', leaderController.getCouncilsPage)
router.get('/api/councils', leaderController.getCouncils)
router.post('/api/create-council', leaderController.createCouncil)
router.post('/api/update-council/:id', leaderController.updateCouncil)
router.delete('/api/delete-council/:id', leaderController.deleteCouncil)
router.get('/api/council-projects/:id', leaderController.getCouncilProjects)
router.post('/api/save-council-grades', leaderController.saveCouncilGrades)
router.post('/api/submit-to-admin', leaderController.submitToAdmin)

// --- 3. REVIEWERS (PHÂN CÔNG PHẢN BIỆN) ---
router.get('/reviewer-assignments', leaderController.getReviewerAssignmentsPage)
router.get('/getReviewerAssignments', leaderController.getReviewerAssignments)
router.post('/assignReviewer', leaderController.assignReviewer)

// --- 4. SCHEDULES (ĐIỀU PHỐI LỊCH BẢO VỆ) ---
router.get('/schedule', leaderController.getLeaderSchedulePage)
router.post('/updateDefenseSchedule', leaderController.updateDefenseSchedule)

// --- 5. CONFIGURATION & MILESTONES (CẤU HÌNH CHUYÊN NGÀNH) ---
router.get('/config', leaderController.getConfigPage)
router.get('/getMilestones', leaderController.getMilestones)
router.post('/createMilestone', leaderController.createMilestone)
router.delete('/deleteMilestone/:id', leaderController.deleteMilestone)
router.post('/updateMajorConfig', leaderController.updateMajorConfig)

// --- AUXILIARY (TEACHERS & STUDENTS) ---
router.get('/teachers', leaderController.getTeachersPage)
router.get('/students', leaderController.getStudentsPage)
router.get('/getTeachers', leaderController.getTeachers)
router.post('/assignRole', leaderController.assignRole)

module.exports = router
