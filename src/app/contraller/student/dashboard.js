
const contentStudent = require('../../models/student')
const contentProject = require('../../models/project')
const conversationData = require('../../models/conversation')
const feedbackData = require('../../models/feedback')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')
const reportData = require('../../models/report')


class DashboardController{
    async index(req,res) {
        try {
            if(!req.session.student) {
                return res.redirect('/accounts/singger')
            }
            
            
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)
            console.log('dữ liệu của student: ',student)
            // const project = data.find(item => item._id.toString() === student.projectId?.toString())
            // console.log('studentStatus: ', student.status)
            const project1 = student.status ? student.status : ''
            // console.log('dữ liệu project:', project1)
            if(project1 == 'approved') {
                const data = []
                function getRemainingDaysInWeek(createdAt) {
                    const startDate = new Date(createdAt);
                    const now = new Date();

                    const diffTime = now - startDate;
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    const passedDaysInWeek = diffDays % 7;

                    const remainingDays = 7 - passedDaysInWeek;

                    return remainingDays;
                }
                function getWeekFromCreatedAt(createdAt) {
                    const startDate = new Date(createdAt);
                    const now = new Date();

                    const diffTime = now - startDate;
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);

                    return Math.floor(diffDays / 7) + 1; // +1 để bắt đầu từ tuần 1
                }
                const conversation =await conversationData.findOne({
                    studentId: studentId,
                })
                const teacher = await teacherData.findById(student.teacherId)
                const project = await contentProject.findById(student.projectId)
                const progress = await progressData.findOne({
                    studentId: studentId,
                })
                const report = await reportData.find({
                    studentId: studentId,
                })
                const feedback = await feedbackData.find({
                    conversationId: conversation._id,
                    status: 'false',
                })
                const feedbackRead = await feedbackData.findOne({
                    conversationId: conversation._id,
                }).sort({ createdAt: -1 })
                const date = new Date(project.createdAt).toLocaleDateString('vi-VN')
                const week = getWeekFromCreatedAt(project.createdAt)
                const day = getRemainingDaysInWeek(project.createdAt)
                console.log('week: ', week)
                console.log('day: ', day)

                data.push({
                    fullName: student.fullName,
                    projectName: project.inputProject,
                    teacherName: teacher.fullName,
                    precent: progress.precent,
                    feedbackCount: feedback.length,
                    report: report,
                    feedbackContent: feedbackRead.content ? feedbackRead.content : 'Không có phản hồi nào',
                    FeedbackDate: feedbackRead.createdAt ? feedbackRead.createdAt.toLocaleDateString('vi-VN') : '',
                    projectCount: 1,
                    projectStatus: progress.precent == 100 ? 'Hoàn thành' : 'Đang tiến hành',
                    week: week,
                    day: day,
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
            const teacherId = await contentProject.findById(projectId).select('teacherId')

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