const teacherData = require('../../models/teacher');
const studentData = require('../../models/student');
const projectData = require('../../models/project');
const reportData = require('../../models/report');

class AccountController {
    async index(req, res) {
        try {
            const teacherId = req.session.teacher;
            if(!teacherId) return res.redirect('/accounts/singger');
            
            const teacher = await teacherData.findById(teacherId);
            
            const studentsCount = await studentData.countDocuments({ teacherId: teacherId, status: 'approved' });
            const pendingReportsCount = await reportData.countDocuments({ teacherId: teacherId, status: 'chờ duyệt' });

            res.render('teacher/account', {
                layout: 'base',
                active: 'account',
                figure: 'teacher',
                teacherData: teacher ? teacher.toObject() : {},
                studentsCount,
                pendingReportsCount
            })
        }
        catch (err) {
            console.log(err);
            res.status(500).send('loi')
        }
    }

    async update(req, res) {
        try {
            const teacherId = req.session.teacher;
            if(!teacherId) return res.status(401).json({error: 'Unauthorized'});
            
            const { teacherPhone, teacherEmail } = req.body;
            await teacherData.findByIdAndUpdate(teacherId, { teacherPhone, teacherEmail });
            
            return res.json({ success: true });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new AccountController