const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const councilModel = require('../../models/council')
const teacherData = require('../../models/teacher')

class MemberController {
    // [GET] /teacher/member/dashboard
    async getDashboard(req, res) {
        try {
            const teacherId = req.session.teacher
            
            // 1. Tìm tất cả các hội đồng mà giảng viên này làm Ủy viên
            const myCouncils = await councilModel.find({
                memberIds: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/member/dashboard', {
                    layout: 'base',
                    active: 'council/unified-view',
                    noCouncil: true
                })
            }

            const councilIds = myCouncils.map(c => c._id)
            
            // 2. Tìm tất cả đồ án thuộc các hội đồng này
            const projectsInCouncils = await projectData.find({ 
                councilId: { $in: councilIds },
                statuss: 'active' 
            }).populate('studentId')

            // 3. Phân tích thống kê cho Dashboard
            let totalStudents = projectsInCouncils.length
            let gradedCount = 0
            
            const councilStats = []

            for (const council of myCouncils) {
                const projects = projectsInCouncils.filter(p => p.councilId.toString() === council._id.toString())
                let councilGraded = 0
                
                for (const p of projects) {
                    if (!p.studentId) continue;
                    // Kiểm tra xem Ủy viên này đã chấm điểm cho sinh viên này chưa
                    const scoreRecord = await scoreData.findOne({ 
                        studentId: p.studentId._id,
                        'councilGrades.teacherId': teacherId 
                    })
                    if (scoreRecord) {
                        gradedCount++
                        councilGraded++
                    }
                }

                councilStats.push({
                    _id: council._id,
                    name: council.councilName,
                    total: projects.length,
                    graded: councilGraded,
                    percentage: projects.length > 0 ? Math.round((councilGraded / projects.length) * 100) : 0,
                    chairman: council.chairmanId ? council.chairmanId.fullName : 'N/A',
                    room: projects[0] ? projects[0].defenseRoom : 'Chưa xếp'
                })
            }

            const stats = {
                totalCouncils: myCouncils.length,
                totalStudents: totalStudents,
                gradedCount: gradedCount,
                pendingCount: totalStudents - gradedCount,
                overallProgress: totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0
            }

            // 4. Lấy danh sách 5 ca bảo vệ gần nhất
            const upcomingDefenses = projectsInCouncils
                .filter(p => p.defenseDate)
                .sort((a, b) => new Date(a.defenseDate) - new Date(b.defenseDate))
                .slice(0, 5)
                .map(p => ({
                    studentName: p.studentId ? p.studentId.fullName : 'N/A',
                    projectName: p.inputProject,
                    time: p.defenseTime,
                    date: p.defenseDate,
                    room: p.defenseRoom,
                    councilId: p.councilId
                }))

            res.render('teacher/member/dashboard', {
                layout: 'base',
                active: 'council/unified-view',
                title: 'Bảng điều khiển (Ủy viên)',
                stats: stats,
                councilStats: councilStats,
                upcomingDefenses: upcomingDefenses
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }

    // [GET] /teacher/member/schedule
    async getSchedule(req, res) {
        try {
            const teacherId = req.session.teacher
            
            // 1. Lấy tất cả hội đồng mà GV này làm Ủy viên
            const myCouncils = await councilModel.find({
                memberIds: teacherId,
                status: 'active'
            })
            .populate('chairmanId', 'fullName')
            .populate('secretaryId', 'fullName')
            .populate('memberIds', 'fullName')

            if (!myCouncils || myCouncils.length === 0) {
                return res.render('teacher/member/schedule', {
                    layout: 'base',
                    active: 'member/schedule',
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

            res.render('teacher/member/schedule', {
                layout: 'base',
                active: 'member/schedule',
                title: 'Lịch Bảo vệ (Ủy viên)',
                myCouncils: myCouncils.map(c => c.toObject()),
                schedules: scheduleData
            })
        } catch (err) {
            console.error(err)
            res.status(500).send('Lỗi Server')
        }
    }
}

module.exports = new MemberController()
