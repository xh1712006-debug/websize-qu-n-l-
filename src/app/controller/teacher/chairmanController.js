const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const councilModel = require('../../models/council')
const teacherData = require('../../models/teacher')

class ChairmanController {
    // [GET] /teacher/chairman/dashboard
    async getDashboard(req, res) {
        try {
            const teacherId = req.session.teacher
            
            // 1. Tìm tất cả hội đồng mà giảng viên này làm Chủ tịch
            const myCouncils = await councilModel.find({
                chairmanId: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/chairman/dashboard', {
                    layout: 'base',
                    active: 'chairman/dashboard',
                    noCouncil: true
                })
            }

            const councilIds = myCouncils.map(c => c._id)
            
            // 2. Tìm sinh viên thuộc các hội đồng này
            const projectsInCouncils = await projectData.find({ 
                councilId: { $in: councilIds },
                statuss: 'active' 
            }).populate('studentId')
            
            const studentsData = []
            for (const p of projectsInCouncils) {
                if (!p.studentId) continue;

                const scoreRecord = await scoreData.findOne({ studentId: p.studentId._id })
                const currentCouncil = myCouncils.find(c => c._id.toString() === p.councilId.toString())

                studentsData.push({
                    _id: p.studentId._id,
                    fullName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    projectName: p.inputProject,
                    councilName: currentCouncil ? currentCouncil.councilName : 'N/A',
                    finalScore: scoreRecord ? scoreRecord.finalScore : null,
                    scoreProgress: scoreRecord ? scoreRecord.councilScores.length : 0,
                    totalMembers: currentCouncil ? (currentCouncil.memberIds.length + 2) : 0,
                    status: scoreRecord ? scoreRecord.status : 'pending',
                    projectStatus: p.status
                })
            }

            const stats = {
                total: studentsData.length,
                pendingFinal: studentsData.filter(s => s.status === 'approved' && s.projectStatus !== 'COMPLETED').length,
                completed: studentsData.filter(s => s.projectStatus === 'COMPLETED').length,
                councilCount: myCouncils.length
            }

            res.render('teacher/chairman/dashboard', {
                layout: 'base',
                active: 'chairman/dashboard',
                myCouncils: myCouncils.map(c => c.toObject()),
                stats,
                studentsCount: studentsData.length
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /teacher/chairman/api/students
    async getCouncilStudents(req, res) {
        try {
            const teacherId = req.session.teacher
            const { councilId } = req.query
            
            // 1. Tìm hội đồng được yêu cầu hoặc tất cả hội đồng của GV này
            let councilFilter = { chairmanId: teacherId, status: 'active' }
            if (councilId) {
                councilFilter._id = councilId
            }
            
            const myCouncils = await councilModel.find(councilFilter)
            if (myCouncils.length === 0) return res.json([])

            const councilIds = myCouncils.map(c => c._id)
            const projects = await projectData.find({ councilId: { $in: councilIds }, statuss: 'active' })
                .populate('studentId')
                .populate('teacherId', 'fullName')
            
            const assignmentModel = require('../../models/assignment')
            const data = []

            for (const p of projects) {
                if (!p.studentId) continue;
                const scoreRecord = await scoreData.findOne({ studentId: p.studentId._id })
                const currentCouncil = myCouncils.find(c => c._id.toString() === p.councilId.toString())
                const reviewerAssign = await assignmentModel.findOne({ studentId: p.studentId._id, role: 'reviewer' }).populate('teacherId', 'fullName')

                // Tính tổng thành viên hội đồng có quyền chấm điểm
                const totalMembers = currentCouncil ? (currentCouncil.memberIds.length + 2) : 5 

                data.push({
                    studentId: p.studentId._id,
                    fullName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode, // Sửa lại truy xuất trực tiếp từ studentId
                    projectName: p.inputProject,
                    advisorName: (p.teacherId) ? p.teacherId.fullName : 'N/A',
                    reviewerName: (reviewerAssign && reviewerAssign.teacherId) ? reviewerAssign.teacherId.fullName : 'N/A',
                    councilName: currentCouncil ? currentCouncil.councilName : 'N/A',
                    finalScore: scoreRecord ? scoreRecord.finalScore : null,
                    status: scoreRecord ? scoreRecord.status : 'pending',
                    projectStatus: p.status,
                    councilCount: scoreRecord ? scoreRecord.councilScores.length : 0,
                    totalMembers, // Thêm trường này
                    defenseQuestionsCount: scoreRecord ? scoreRecord.defenseQuestions.length : 0,
                    defenseQuestions: scoreRecord ? scoreRecord.defenseQuestions : [],
                    defenseConclusion: scoreRecord ? scoreRecord.defenseConclusion : ''
                })
            }
            res.json(data)
        } catch (err) {
            console.error(err)
        }
    }

    // [GET] /teacher/chairman/defense
    async getDefenseControl(req, res) {
        try {
            const teacherId = req.session.teacher
            const { councilId } = req.query

            // 1. Tìm tất cả hội đồng mà giảng viên này làm Chủ tịch
            const myCouncils = await councilModel.find({
                chairmanId: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/chairman/defense', {
                    layout: 'base',
                    noCouncil: true
                })
            }

            // 2. Xác định hội đồng active
            let activeCouncil = null
            if (councilId) {
                activeCouncil = myCouncils.find(c => c._id.toString() === councilId)
            }
            if (!activeCouncil) activeCouncil = myCouncils[0]

            res.render('teacher/chairman/defense', {
                layout: 'base',
                active: 'council/defense',
                title: 'Điều hành Bảo vệ (Chủ tịch)',
                myCouncils: myCouncils.map(c => c.toObject()),
                activeCouncil: activeCouncil.toObject()
            });
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [POST] /teacher/chairman/api/update-status
    async updateDefenseStatus(req, res) {
        try {
            const teacherId = req.session.teacher
            const { studentId, status } = req.body // status: wait, active, finished
            
            // Kiểm tra xem giảng viên có phải là chủ tịch của hội đồng chứa sinh viên này không
            const project = await projectData.findOne({ studentId, statuss: 'active' })
            if (!project) return res.status(404).json({ success: false, message: 'Không tìm thấy đồ án' })

            const council = await councilModel.findOne({ _id: project.councilId, chairmanId: teacherId })
            if (!council) return res.status(403).json({ success: false, message: 'Bạn không có quyền này' })

            project.status = status
            await project.save()
            
            res.json({ success: true, message: 'Cập nhật trạng thái bảo vệ thành công' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [POST] /teacher/chairman/api/approve-final
    async approveFinal(req, res) {
        try {
            const teacherId = req.session.teacher
            const { studentId } = req.body
            
            const scoreRecord = await scoreData.findOne({ studentId })
            if (!scoreRecord || !scoreRecord.finalScore) {
                return res.json({ success: false, message: 'Vui lòng yêu cầu Thư ký tổng hợp điểm trước khi duyệt.' })
            }

            if (scoreRecord.defenseQuestions.length === 0 || !scoreRecord.defenseConclusion) {
                return res.json({ success: false, message: 'Vui lòng yêu cầu Thư ký hoàn thiện biên bản trước khi duyệt.' })
            }

            // Verify Chairman role for this specific council
            const project = await projectData.findOne({ studentId, statuss: 'active' })
            const council = await councilModel.findOne({ _id: project.councilId, chairmanId: teacherId })
            if (!council) return res.status(403).json({ success: false, message: 'Bạn không có quyền duyệt cuối cho hội đồng này' })

            scoreRecord.status = 'approved'
            scoreRecord.isLocked = true
            scoreRecord.lockedAt = Date.now()
            scoreRecord.approvedBy = teacherId

            await scoreRecord.save()

            if (project) {
                project.status = 'COMPLETED'
                await project.save()
            }

            // Gửi thông báo ... (Logic notification có thể copy từ score.js hoặc giữ nguyên nếu dùng chung)
            const notificationModel = require('../../models/notification')
            const student = await studentData.findById(studentId)
            
            const notifications = [
                new notificationModel({
                    receiverId: studentId,
                    title: 'Kết quả bảo vệ chính thức',
                    message: `Chúc mừng! Kết quả bảo vệ đồ án của bạn đã được Chủ tịch phê duyệt với điểm số: ${scoreRecord.finalScore}.`,
                    type: 'success',
                    link: '/student/project'
                })
            ]
            if (project.teacherId) {
                notifications.push(new notificationModel({
                    receiverId: project.teacherId,
                    title: 'Sinh viên đã có điểm bảo vệ',
                    message: `Sinh viên ${student.fullName} đã được Chủ tịch phê duyệt điểm bảo vệ cuối cùng: ${scoreRecord.finalScore}.`,
                    type: 'info',
                    link: '/teacher/report'
                }))
            }
            await Promise.all(notifications.map(n => n.save()))

            res.json({ success: true, message: 'Đã phê duyệt kết quả và gửi thông báo thành công.' })
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /teacher/chairman/schedule
    async getSchedule(req, res) {
        try {
            const teacherId = req.session.teacher
            
            // 1. Lấy tất cả hội đồng mà GV này làm Chủ tịch
            const myCouncils = await councilModel.find({
                chairmanId: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/chairman/schedule', {
                    layout: 'base',
                    active: 'council/schedule',
                    noCouncil: true
                })
            }

            // 2. Lấy tất cả đồ án thuộc các hội đồng này
            const councilIds = myCouncils.map(c => c._id)
            const projects = await projectData.find({ 
                councilId: { $in: councilIds }, 
                statuss: 'active' 
            })
            .populate('studentId')
            .populate('teacherId', 'fullName') // GVHD
            .sort({ defenseDate: 1, defenseTime: 1 })

            const scheduleData = projects.map(p => {
                if (!p.studentId) return null;
                const currentCouncil = myCouncils.find(c => c._id.toString() === p.councilId.toString())
                return {
                    studentName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    projectName: p.inputProject,
                    councilName: currentCouncil ? currentCouncil.councilName : 'N/A',
                    defenseDate: p.defenseDate,
                    defenseTime: p.defenseTime,
                    defenseRoom: p.defenseRoom,
                    advisorName: p.teacherId ? p.teacherId.fullName : 'N/A',
                    status: p.status,
                    councilId: p.councilId
                }
            }).filter(s => s !== null)

            res.render('teacher/chairman/schedule', {
                layout: 'base',
                active: 'council/schedule',
                title: 'Lịch Bảo vệ (Chủ tịch)',
                myCouncils: myCouncils.map(c => c.toObject()),
                schedules: scheduleData
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }
}

module.exports = new ChairmanController
