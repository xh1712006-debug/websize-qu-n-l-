const studentData = require('../../models/student')
const teacherData = require('../../models/teacher')

class microsoftController{
    async index(req,res) {
        try {
            res.render('microsoft/reg', {
                layout: 'microsoft/main',
                figure: 'microsoft',
                active: 'reg'
            })
        }
        catch(err) {
            console.error(err)
            res.status(500).send('Lỗi hiển thị trang đăng ký')
        }
    }

    async postPassword(req, res){
        try {
            const password = req.body.password
            const studentId = req.session.student
            const teacherId = req.session.teacher

            if (studentId) {
                console.log('Cập nhật mật khẩu cho sinh viên:', studentId)
                await studentData.findByIdAndUpdate(studentId, { password })
                return res.redirect('/student/dashboard')
            } 
            
            if (teacherId) {
                console.log('Cập nhật mật khẩu cho giáo viên:', teacherId)
                await teacherData.findByIdAndUpdate(teacherId, { password })
                return res.redirect('/teacher/dashboard')
            }

            res.status(401).send('Phiên đăng nhập không hợp lệ')
        }
        catch(err) {
            console.error(err)
            res.status(500).send('Lỗi cập nhật mật khẩu')
        }
    }
}

module.exports = new microsoftController
