const Content = require('../../models/dashboard')
const contentStudent = require('../../models/student')
const contentProject = require('../../models/project')
const conversationData = require('../../models/conversation')

class DashboardController{
    async index(req,res) {
        try {
            if(!req.session.student) {
                return res.redirect('/accounts/singger')
            }
            let data = await Content.find()
            data = data.map(item => item.toObject())
            
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)
            console.log('dữ liệu của student: ',student)
            // const project = data.find(item => item._id.toString() === student.projectId?.toString())
            console.log('studentStatus: ', student.status)
            const project = student.status ? student.status : ''
            console.log('dữ liệu project:', project)
            if(project == 'approved') {
                const conversation =await conversationData.findOne({
                    studentId: studentId,
                })

                console.log('đã lưu đưuco giá trị: ', conversation.teacherId)
                req.session.teacherId = conversation.teacherId
                return res.render('student/window/dashboard', {
                    layout: 'student/main',
                    active: 'dashboard',
                    data: data,
                    figure: 'student',
                })
                
            }
            return res.render('student/window/reg', {
                layout: 'student/main',
                active: 'reg',
                data: data,
                figure: 'student/window',
            })
            
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi dữ liệu ')
        }
    }

    async selectProject(req, res) {
        try {
            const projectId = req.body.projectId
            const studentId = req.session.student
            const teacherId = await contentProject.findOne(projectId).select('teacherId')

            console.log("student:", studentId)
            console.log("projectId:", projectId)
            const project = await contentStudent.findById(studentId)

            console.log('dư liệu student: ',project)
            
            project.status = 'pending'
            project.projectId = projectId
            project.teacherId = teacherId.teacherId

            req.session.teacherId = project.teacherId

            const newconversation = new conversationData({
                teacherId: teacherId.teacherId,
                studentId: studentId,

            })
            await newconversation.save()

            await project.save()
            res.json({ message: 'Chọn đồ án thành công' })
            window.location.reload()
        }
        catch(err) {
            console.log(err)
            res.status(500).json({ message: 'Có lỗi xảy ra khi chọn đồ án!' })
        }
        
    }
}

module.exports = new DashboardController