const projectModel = require('../../models/project')
const studentModel = require('../../models/student')
const councilModel = require('../../models/council')
const teacherModel = require('../../models/teacher')
const periodModel = require('../../models/period')

class scheduleController {
    // [GET] /teacher/schedule
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            if (!teacherId) return res.redirect('/accounts/singger');

            // 1. Tìm tất cả sinh viên được giáo viên này hướng dẫn (status: approved)
            const guidedStudents = await studentModel.find({ 
                teacherId: teacherId,
                status: 'approved'
            }).lean();

            const scheduleData = [];
            for (const st of guidedStudents) {
                // 2. Tìm đồ án đang hoạt động của sinh viên
                const project = await projectModel.findOne({ 
                    studentId: st._id, 
                    statuss: 'active' 
                })
                .populate('councilId')
                .populate('teacherFeedbackId', 'fullName');

                let councilDetails = null;
                if (project && project.councilId) {
                    councilDetails = await councilModel.findById(project.councilId)
                        .populate('chairmanId', 'fullName')
                        .populate('secretaryId', 'fullName')
                        .populate('memberIds', 'fullName');
                }

                scheduleData.push({
                    studentName: st.fullName,
                    studentCode: st.studentCode,
                    inputProject: project ? project.inputProject : 'Chưa đăng ký đề tài',
                    defenseDate: project ? project.defenseDate : null,
                    defenseTime: project ? project.defenseTime : null,
                    defenseRoom: project ? project.defenseRoom : null,
                    status: project ? project.status : 'N/A',
                    reviewerName: project ? (project.teacherFeedbackName || (project.teacherFeedbackId ? project.teacherFeedbackId.fullName : 'Chưa phân công')) : 'Chưa phân công',
                    council: councilDetails ? councilDetails.toObject() : null,
                    projectId: project ? project._id : null
                });
            }

            // 3. Thống kê nhanh cho dashboard
            const stats = {
                total: scheduleData.length,
                scheduled: scheduleData.filter(s => s.defenseDate).length,
                pending: scheduleData.filter(s => !s.defenseDate).length
            };

            // 4. Lấy thông tin Đợt đăng ký hiện tại (ACTIVE)
            const activePeriod = await periodModel.findOne({ status: 'ACTIVE' }).lean();

            res.render('teacher/studentSchedule', {
                layout: 'base',
                active: 'schedule',
                title: 'Lịch bảo vệ Sinh viên Hướng dẫn',
                projects: scheduleData,
                stats: stats,
                activePeriod: activePeriod
            });

        } catch (err) {
            console.error('ScheduleController Error:', err);
            res.status(500).send('Lỗi máy chủ khi tải lịch bảo vệ');
        }
    }
}

module.exports = new scheduleController();
