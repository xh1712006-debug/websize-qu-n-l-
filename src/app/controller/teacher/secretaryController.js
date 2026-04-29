const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const councilModel = require('../../models/council')
const teacherData = require('../../models/teacher')

class SecretaryController {
    // [GET] /teacher/secretary/dashboard
    async getDashboard(req, res) {
        try {
            const teacherId = req.session.teacher
            
            // 1. Tìm tất cả các hội đồng mà giảng viên này làm Thư ký
            const myCouncils = await councilModel.find({
                secretaryId: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/secretary/dashboard', {
                    layout: 'base',
                    active: 'secretary/dashboard',
                    noCouncil: true
                })
            }

            const councilIds = myCouncils.map(c => c._id)
            
            // 2. Tìm tất cả sinh viên thuộc tất cả các hội đồng này
            const projectsInCouncils = await projectData.find({ 
                councilId: { $in: councilIds },
                statuss: 'active' 
            }).populate('studentId')
            
            const studentsData = []
            for (const p of projectsInCouncils) {
                if (!p.studentId) continue;

                const scoreRecord = await scoreData.findOne({ studentId: p.studentId._id })
                
                // Tìm hội đồng tương ứng để lấy tên phòng/hội đồng
                const currentCouncil = myCouncils.find(c => c._id.toString() === p.councilId.toString())

                studentsData.push({
                    _id: p.studentId._id,
                    fullName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    projectName: p.inputProject,
                    councilName: currentCouncil ? currentCouncil.councilName : 'N/A',
                    finalScore: scoreRecord ? scoreRecord.finalScore : null,
                    hasMinutes: scoreRecord && scoreRecord.defenseQuestions && scoreRecord.defenseQuestions.length > 0,
                    scoreProgress: scoreRecord ? scoreRecord.councilScores.length : 0,
                    totalMembers: currentCouncil ? (currentCouncil.memberIds.length + 2) : 0,
                    status: scoreRecord ? scoreRecord.status : 'pending'
                })
            }

            const stats = {
                total: studentsData.length,
                recorded: studentsData.filter(h => h.hasMinutes).length,
                synthesized: studentsData.filter(s => s.finalScore != null).length,
                councilCount: myCouncils.length
            }

            res.render('teacher/secretary/dashboard', {
                layout: 'base',
                active: 'secretary/dashboard',
                myCouncils: myCouncils.map(c => c.toObject()),
                stats,
                students: studentsData,
                studentsCount: studentsData.length
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /teacher/secretary/minutes
    async getMinutesPage(req, res) {
        res.render('teacher/secretary/minutes', {
            layout: 'base',
            active: 'secretary/minutes',
            title: 'Ghi Biên bản Bảo vệ'
        })
    }

    // [GET] /teacher/secretary/synthesis
    async getSynthesisPage(req, res) {
        res.render('teacher/secretary/synthesis', {
            layout: 'base',
            active: 'secretary/synthesis',
            title: 'Tổng hợp & Xuất báo cáo'
        })
    }

    // [GET] /teacher/secretary/api/students
    async getCouncilStudents(req, res) {
        try {
            const teacherId = req.session.teacher
            const myCouncils = await councilModel.find({ secretaryId: teacherId, status: 'active' })
            const councilIds = myCouncils.map(c => c._id)

            if (councilIds.length === 0) return res.json([])

            const projects = await projectData.find({ councilId: { $in: councilIds }, statuss: 'active' })
                .populate('studentId')
                .populate('teacherId', 'fullName')
            
            const assignmentModel = require('../../models/assignment')

            const data = []
            for (const p of projects) {
                if (!p.studentId) continue;
                const scoreRecord = await scoreData.findOne({ studentId: p.studentId._id })
                const currentCouncil = myCouncils.find(c => c._id.toString() === p.councilId.toString())

                // Tìm GVPB từ assignment
                const reviewerAssign = await assignmentModel.findOne({ studentId: p.studentId._id, role: 'reviewer' }).populate('teacherId', 'fullName')

                data.push({
                    studentId: p.studentId._id,
                    fullName: p.studentId.fullName,
                    studentCode: p.studentId.studentCode,
                    projectName: p.inputProject,
                    advisorName: (p.teacherId) ? p.teacherId.fullName : 'N/A',
                    reviewerName: (reviewerAssign && reviewerAssign.teacherId) ? reviewerAssign.teacherId.fullName : 'N/A',
                    councilName: currentCouncil ? currentCouncil.councilName : 'N/A',
                    finalScore: scoreRecord ? scoreRecord.finalScore : null,
                    defenseQuestions: scoreRecord ? scoreRecord.defenseQuestions : [],
                    defenseConclusion: scoreRecord ? scoreRecord.defenseConclusion : '',
                    status: scoreRecord ? scoreRecord.status : 'pending',
                    councilScoresCount: scoreRecord ? scoreRecord.councilScores.length : 0,
                    councilMembersCount: currentCouncil ? (currentCouncil.memberIds.length + 2) : 0
                })
            }
            res.json(data)
        } catch (err) {
            console.error(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    // [GET] /teacher/secretary/schedule
    async getSchedulePage(req, res) {
        try {
            const teacherId = req.session.teacher
            const myCouncils = await councilModel.find({
                secretaryId: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/secretary/schedule', {
                    layout: 'base',
                    active: 'secretary/schedule',
                    noCouncil: true
                })
            }

            const councilIds = myCouncils.map(c => c._id)
            const projects = await projectData.find({ 
                councilId: { $in: councilIds }, 
                statuss: 'active' 
            })
            .populate('studentId')
            .populate('teacherId', 'fullName') // GVHD
            .sort({ defenseTime: 1 })

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
                    status: p.status
                }
            }).filter(s => s !== null)

            res.render('teacher/secretary/schedule', {
                layout: 'base',
                active: 'secretary/schedule',
                title: 'Lịch Bảo vệ Hội đồng',
                myCouncils: myCouncils.map(c => c.toObject()),
                schedules: scheduleData
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }
}

module.exports = new SecretaryController()
