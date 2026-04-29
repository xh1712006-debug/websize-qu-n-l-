<<<<<<< HEAD:src/app/contraller/accounts/loggin.js
const content_student = require('../../models/student');
const content_teacher = require('../../models/teacher');
const content_admin = require('../../models/admin');

class LogginController {
    // [GET] /loggin
    async index(req, res) {
        try {
            res.render('accounts/loggin', {
                layout: 'accounts/main',
                active: 'loggin',
                figure: 'accounts',
            });
        } catch (err) {
            console.error('Render Login Error:', err);
            res.status(500).send('Lỗi hệ thống');
        }
    }

    // [POST] /loggin (Unified Login Handler)
    async send(req, res) {
        try {
            const { email, password, role } = req.body;

            if (!email || !password || !role) {
                return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
            }

            let user;
            let redirectUrl = '/';

            switch (role) {
                case 'student':
                    user = await content_student.findOne({ studentEmail: email, password: password });
                    if (user) {
                        req.session.student = user._id;
                        req.session.userS = { // Isolated key for Student
                            id: user._id,
                            fullName: user.fullName,
                            studentCode: user.studentCode,
                            studentEmail: user.studentEmail,
                            studentClass: user.studentClass,
                            studentMajor: user.studentMajor
                        };
                        
                        // Smart Redirect: If already has project, go straight to project page
                        redirectUrl = user.projectId ? '/student/project' : '/student/dashboard';
                    }
                    break;

                case 'teacher':
                    // In your system, password for teacher is teacherCode
                    user = await content_teacher.findOne({ teacherEmail: email, teacherCode: password });
                    if (user) {
                        req.session.teacher = user._id;
                        req.session.teacherRole = user.teacherRole;
                        req.session.userT = {
                            id: user._id,
                            fullName: user.fullName,
                            teacherCode: user.teacherCode,
                            teacherEmail: user.teacherEmail,
                            teacherRole: user.teacherRole,
                            teacherDepartment: user.teacherDepartment,
                            teacherDegree: user.teacherDegree
                        };
                        
                        // Smart Redirect based on SubRoles
                        redirectUrl = '/teacher/dashboard';
                        if (user.subRoles && user.subRoles.isLeader) {
                            redirectUrl = '/teacher/leader';
                        } else if (user.councilPosition === 'Chairman') {
                            redirectUrl = '/teacher/chairman/dashboard';
                        } else if (user.councilPosition === 'Secretary') {
                            redirectUrl = '/teacher/secretary/dashboard';
                        }
                    }
                    break;

                case 'admin':
                    user = await content_admin.findOne({ email: email, password: password });
                    if (user) {
                        req.session.admin = user._id;
                        req.session.userA = { // Isolated key for Admin
                            id: user._id,
                            fullName: user.fullName,
                            email: user.email,
                            role: 'Admin'
                        };
                        redirectUrl = '/admin/dashboard';
                    }
                    break;

                default:
                    return res.status(400).json({ success: false, message: 'Đối tượng đăng nhập không hợp lệ' });
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
            }

            return res.json({ success: true, redirectUrl });

        } catch (err) {
            console.error('Unified Auth Error:', err);
            res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // [GET] /loggin/logout
    async logout(req, res) {
        try {
            const role = req.query.role;
            
            if (role === 'student') {
                delete req.session.student;
                delete req.session.userS;
            } else if (role === 'teacher') {
                delete req.session.teacher;
                delete req.session.userT;
                delete req.session.subRoles;
                delete req.session.teacherRole;
                delete req.session.councilPosition;
            } else if (role === 'admin') {
                delete req.session.admin;
                delete req.session.userA;
            } else {
                // Nếu không có role cụ thể, hoặc logout toàn bộ
                return req.session.destroy((err) => {
                    if (err) console.error('Logout error:', err);
                    res.redirect('/loggin');
                });
            }

            // Sau khi xóa một phần, lưu lại session và redirect kèm tham số role để UI biết
            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                res.redirect(`/loggin?role=${role}&status=logout_success`);
            });

        } catch (err) {
            console.error('Partial Logout Error:', err);
=======
const content_loggin = require('../../models/student')
const content_teacher = require('../../models/teacher')

class logginController{
    async index(req,res) {
        try {
            let data_loggin = await content_loggin.find()
            data_loggin = data_loggin.map(item => item.toObject())
            res.render('accounts/loggin', {
                layout: 'accounts/main',
                active: 'loggin',
                data_loggin: data_loggin,
                figure: 'loggin',
                id: data_loggin._id,
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    
    async send(req, res) {
        try{
            console.log(req.body)
            const email = req.body.email
            const password = req.body.password

            console.log(email, password)

            const user = await content_loggin.findOne({
                studentEmail: email,
                password: password,
            })

            console.log('data base được lưu id: ', user._id)

            const allUsers = await content_loggin.find()
            console.log("TẤT CẢ USER TRONG DB:", allUsers)

            if (!user) {
            return res.send('Sai tài khoản hoặc mật khẩu')
            }

            req.session.student = user._id

            
            // 🔥 LƯU SESSION Ở ĐÂY
            req.session.user = {
                id: user._id,
                fullName: user.fullName,
                studentCode: user.studentCode,
                studentEmail: user.studentEmail,
                StudentClass: user.StudentClass,
                major: user.major
            }

            return res.json({ success: true })

        }
         catch (err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }
    async sendTeacher(req, res) {
        try{
            console.log(req.body)
            const email = req.body.email
            const password = req.body.password

            console.log(email, password)

            const user = await content_teacher.findOne({
                teacherEmail: email,
                teacherCode: password,
            })

            console.log('data base được lưu id: ', user._id)

            const allUsers = await content_teacher.find()
            console.log("TẤT CẢ USER TRONG DB:", allUsers)

            if (!user) {
            return res.send('Sai tài khoản hoặc mật khẩu')
            }

            req.session.teacher = user._id

            
            // 🔥 LƯU SESSION Ở ĐÂY
            req.session.userT = {
                id: user._id,
                fullName: user.fullName,
                teacherCode: user.teacherCode,
                teacherEmail: user.teacherEmail,
                teacherClass: user.teacherClass,
                major: user.major
            }

            return res.json({ success: true })

        }
         catch (err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if(err) {
                    console.log('Error destroying session:', err);
                }
                res.redirect('/loggin');
            });
        } catch (err) {
            console.log(err);
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/accounts/loggin.js
            res.redirect('/loggin');
        }
    }
}

<<<<<<< HEAD:src/app/contraller/accounts/loggin.js
module.exports = new LogginController();
=======


module.exports = new logginController
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/accounts/loggin.js
