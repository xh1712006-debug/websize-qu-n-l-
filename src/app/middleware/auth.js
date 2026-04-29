const teacherData = require('../models/teacher');
const gradeData = require('../models/grade');
const studentData = require('../models/student');
const feedbackData = require('../models/feedback');
const conversationData = require('../models/conversation');

module.exports = {
    // Chỉ cho phép sinh viên
    isStudent: async (req, res, next) => {
        if (req.session.student) {
            try {
                // Query DB để lấy dữ liệu sinh viên mới nhất
                const student = await studentData.findById(req.session.student);
                if (!student) return res.redirect('/loggin');

                // Đồng bộ lại session.userS (Isolated)
                req.session.userS = {
                    id: student._id,
                    fullName: student.fullName,
                    studentCode: student.studentCode,
                    studentEmail: student.studentEmail,
                    studentClass: student.studentClass,
                    studentMajor: student.studentMajor,
                    projectId: student.projectId || null,
                    status: student.status || null,
                };

                res.locals.userRole = 'Student';
                // Đảm bảo res.locals.user vẫn hoạt động cho các template dùng {{user.xxx}}
                res.locals.user = req.session.userS;
                res.locals.userObj = req.session.userS;
                res.locals.hasProject = student.status === 'approved';

                // Lấy số lượng feedback chưa đọc
                let unreadCount = 0;
                const conversation = await conversationData.findOne({ studentId: student._id });
                if (conversation) {
                    unreadCount = await feedbackData.countDocuments({
                        conversationId: conversation._id,
                        contentType: 'teacher',
                        status: 'false'
                    });
                }
                res.locals.unreadFeedbackCount = unreadCount;

                const grade = await gradeData.findOne({ studentId: student._id });
                res.locals.isGradePublished = (grade && grade.status === 'approved');

                return next();
            } catch (err) {
                console.error('isStudent Auth Error:', err);
                return res.redirect('/loggin');
            }
        }
        res.redirect('/loggin');
    },

    // Chỉ cho phép giảng viên
    isTeacher: async (req, res, next) => {
        if (req.session.teacher) {
            try {
                const teacher = await teacherData.findById(req.session.teacher);
                if (teacher) {
                    req.session.teacherRole = teacher.teacherRole;
                    req.session.subRoles = teacher.subRoles || { isGVHD: false, isGVPB: false, isCouncil: false, isLeader: false };
                    req.session.councilPosition = teacher.councilPosition || null;
                    
                    res.locals.userRole = 'Teacher';
                    res.locals.userObj = {
                        fullName: teacher.fullName,
                        teacherCode: teacher.teacherCode,
                        email: teacher.teacherEmail
                    };
                    res.locals.subRoles = req.session.subRoles;
                    res.locals.councilPosition = req.session.councilPosition;
                    res.locals.userT = teacher.toObject();
                } else {
                    return res.redirect('/loggin');
                }
                return next();
            } catch (err) {
                console.error('Auth Sync Error:', err);
                return res.redirect('/loggin');
            }
        }
        res.redirect('/loggin');
    },

    // ... (checkSubRole, checkCouncilPosition, checkGradeLock giữ nguyên)
    checkSubRole: (roleName) => {
        return (req, res, next) => {
            const subRoles = req.session.subRoles || {};
            if (req.session.teacher && subRoles[roleName] === true) {
                res.locals.userRole = 'Teacher';
                return next();
            }
            res.status(403).render('error/403', { layout: 'base', message: 'Bạn không có quyền truy cập chức năng này.' });
        };
    },

    checkCouncilPosition: (positions) => {
        return (req, res, next) => {
            if (req.session.teacher && positions.includes(req.session.councilPosition)) {
                return next();
            }
            res.status(403).send('Chức năng này chỉ dành cho một số vị trí nhất định trong hội đồng.');
        };
    },

    checkGradeLock: async (req, res, next) => {
        try {
            const { studentId } = req.body;
            if (!studentId) return next();
            const grade = await gradeData.findOne({ studentId });
            if (grade && grade.isLocked) return res.status(403).json({ success: false, message: 'Điểm đã bị khóa, không thể chỉnh sửa.' });
            next();
        } catch (err) {
            next();
        }
    },

    // Admin Auth
    isAdmin: (req, res, next) => {
        if (req.session.admin) {
            res.locals.userRole = 'Admin';
            // Đồng bộ từ session.userA (Isolated)
            res.locals.userObj = req.session.userA || {
                fullName: 'Quản trị viên',
                email: 'admin@university.edu'
            };
            res.locals.user = res.locals.userObj; // Compatibility
            res.locals.admin = res.locals.userObj;
            return next();
        }
        res.redirect('/loggin');
    }
};
