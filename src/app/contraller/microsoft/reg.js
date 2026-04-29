const studentData = require('../../models/student')
const teacherData = require('../../models/teacher')

class microsoftController {
    async index(req, res) {
        try {
            let user = null;
            let role = '';

            if (req.session.student) {
                user = await studentData.findById(req.session.student);
                role = 'sinh viên';
            } else if (req.session.teacher) {
                user = await teacherData.findById(req.session.teacher);
                role = 'giảng viên';
            }

            if (!user) return res.redirect('/loggin');

            // Bảo vệ: Chỉ cho phép nếu chưa có mật khẩu
            if (user.password) {
                if (req.session.student && user.projectId) {
                    return res.redirect('/student/project');
                }
                return res.redirect(req.session.student ? '/student/dashboard' : '/teacher/dashboard');
            }

            res.render('microsoft/reg', {
                layout: 'microsoft/main',
                figure: 'microsoft',
                active: 'reg',
                user: user.toObject(),
                role: role
            })
        }
        catch (err) {
            console.error(err);
            res.status(500).send('loi');
        }
    }

    async postPassword(req, res) {
        try {
            const { password } = req.body;
            if (!password || password.length < 6) {
                return res.json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
            }

            if (req.session.student) {
                const student = await studentData.findByIdAndUpdate(req.session.student, { password }, { new: true });
                const redirectPath = student.projectId ? '/student/project' : '/student/dashboard';
                return res.json({ success: true, redirect: redirectPath });
            } else if (req.session.teacher) {
                await teacherData.findByIdAndUpdate(req.session.teacher, { password });
                return res.json({ success: true, redirect: '/teacher/dashboard' });
            }

            res.json({ success: false, message: 'Phiên làm việc hết hạn!' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
}

module.exports = new microsoftController