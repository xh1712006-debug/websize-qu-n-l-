const studentData = require('../../models/student');
const reportData = require('../../models/report');
const feedbackData = require('../../models/feedback');
const teacherData = require('../../models/teacher');
const conversationData = require('../../models/conversation');
const periodData = require('../../models/period');

class DashboardController {
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            if(!teacherId) return res.redirect('/accounts/singger');
            
            // Get Teacher Profile
            const teacher = await teacherData.findById(teacherId);
            const teacherRole = req.session.teacherRole;

            const activePeriod = await periodData.findOne({ status: 'ACTIVE' });
            const periodFilter = activePeriod ? { periodId: activePeriod._id } : {};

            let studentsCount = 0;
            let pendingReportsCount = 0;
            let unreadFeedbacksCount = 0;
            let supervisedStudents = [];

            if (teacherRole === 'Council') {
                studentsCount = await studentData.countDocuments({ status: 'approved' });
                const scoreData = require('../../models/grade');
                pendingReportsCount = await scoreData.countDocuments({ score: null }); 
            } else if (teacherRole === 'GVPB') {
                const assignmentData = require('../../models/assignment');
                const assignments = await assignmentData.find({ teacherId: teacherId });
                studentsCount = assignments.length;
            } else {
                // ĐỐI VỚI GV HƯỚNG DẪN (GVHD)
                const projectData = require('../../models/project');
                const progressData = require('../../models/progress');
                
                // Lấy danh sách đồ án đang hướng dẫn (Chỉ trong đợt hiện tại)
                const myProjects = await projectData.find({ 
                    teacherId: teacherId,
                    statuss: 'active',
                    ...periodFilter
                }).populate('studentId');
                
                studentsCount = myProjects.length;
                pendingReportsCount = await reportData.countDocuments({ 
                    teacherId: teacherId, 
                    status: 'chờ duyệt' 
                });
                
                // Trình hội thoại
                const conversations = await conversationData.find({ teacherId: teacherId });
                const conversationIds = conversations.map(c => c._id);
                unreadFeedbacksCount = await feedbackData.countDocuments({
                    conversationId: { $in: conversationIds },
                    contentType: 'student',
                    status: 'false'
                });

                // Chuẩn bị dữ liệu cho bảng giám sát ở Dashboard
                for(const p of myProjects) {
                    if(!p.studentId) continue;
                    const progress = await progressData.findOne({ studentId: p.studentId._id });
                    const studentReports = await reportData.countDocuments({ 
                        studentId: p.studentId._id,
                        status: 'chờ duyệt'
                    });

                    supervisedStudents.push({
                        _id: p.studentId._id,
                        fullName: p.studentId.fullName,
                        studentCode: p.studentId.studentCode,
                        projectName: p.inputProject,
                        progress: progress ? progress.percent : 0,
                        pendingReports: studentReports
                    });
                }
            }

            res.render('teacher/dashboard', {
                layout: 'base',
                active: 'teacher/dashboard',
                figure: 'teacher',
                teacherName: teacher ? teacher.fullName : 'Giảng viên',
                teacherDept: teacherRole || 'Giảng viên hướng dẫn',
                studentsCount,
                pendingReportsCount,
                unreadFeedbacksCount,
                supervisedStudents
            })
        }
        catch (err) {
            console.log(err);
            res.status(500).send('loi')
        }
    }
}

module.exports = new DashboardController