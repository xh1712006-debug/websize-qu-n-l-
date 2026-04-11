const studentData = require('../../models/student');
const reportData = require('../../models/report');
const feedbackData = require('../../models/feedback');
const teacherData = require('../../models/teacher');
const conversationData = require('../../models/conversation');

class DashboardController {
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            if(!teacherId) return res.redirect('/loggin');
            
            // Get Teacher Profile
            const teacher = await teacherData.findById(teacherId);

            // Fetch actual statistics
            const studentsCount = await studentData.countDocuments({ teacherId: teacherId, status: 'approved' });
            const pendingReportsCount = await reportData.countDocuments({ teacherId: teacherId, status: 'chờ duyệt' });
            
            // For Feedbacks: unread messages from students
            const conversations = await conversationData.find({ teacherId: teacherId });
            const conversationIds = conversations.map(c => c._id);
            const unreadFeedbacksCount = await feedbackData.countDocuments({
                conversationId: { $in: conversationIds },
                contentType: 'student',
                status: 'false'
            });

            res.render('teacher/dashboard', {
                layout: 'teacher/main',
                active: 'dashboard',
                figure: 'teacher',
                teacherName: teacher ? teacher.fullName : 'Giảng viên',
                teacherDept: teacher ? teacher.department : 'Giáo viên hướng dẫn',
                studentsCount,
                pendingReportsCount,
                unreadFeedbacksCount
            })
        }
        catch (err) {
            console.log(err);
            res.status(500).send('loi')
        }
    }
}

module.exports = new DashboardController
