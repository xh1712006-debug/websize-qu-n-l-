const content_teacher = require('../../models/teacher')
const content_project = require('../../models/project')
const content_student = require('../../models/student')

class addprojectController {
    async index(req, res) {
        try {
            if(!req.session.student){
                return res.redirect('/loggin')
            }
            
            const studentId = req.session.student
            const student = await content_student.findById(studentId)

            // Fetch list of teachers
            let data_teacher = await content_teacher.find()
            data_teacher = data_teacher.map(item => item.toObject())
            
            res.render('student/addproject', {
                layout: 'student/main',
                active: 'addproject',
                figure: 'student',
                data_teacher: data_teacher,
                user: req.session.user,
                studentInfo: student.toObject()
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async addProject(req, res) {
        try {
            if(!req.session.student){
                return res.json({ success: false, message: 'Chưa đăng nhập' })
            }
            
            const teacherId = req.body.teacherId
            const projectName = req.body.projectName

            if (!teacherId || !projectName) {
                 return res.json({ success: false, message: 'Thiếu thông tin đăng ký' })
            }

            const studentId = req.session.student
            const student = await content_student.findById(studentId)

            if (student.status === 'pending') {
                 return res.json({ success: false, message: 'Bạn đã đăng ký trước đó rồi, vui lòng chờ duyệt!' })
            }

            const teacher = await content_teacher.findById(teacherId)

            const newProjectRequest = new content_project({
                teacherId: teacherId,
                studentId: studentId,
                inputProject: projectName,
                statuss: 'request',
                teacherFeedbackId: teacherId,
                teacherFeedbackName: teacher.fullName
            })

            await newProjectRequest.save()

            student.projectId = newProjectRequest._id
            student.status = 'pending'
            student.teacherId = teacherId
            await student.save()

            return res.json({ success: true, message: 'Gửi yêu cầu thành công' })

        } catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new addprojectController
