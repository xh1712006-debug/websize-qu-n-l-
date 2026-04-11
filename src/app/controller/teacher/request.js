const content_project = require('../../models/project')
const content_student = require('../../models/student')
const progressData = require('../../models/progress')
const assignmentData = require('../../models/assignment')
const conversationData = require('../../models/conversation')
const scoreData = require('../../models/grade')

class requestController {
    async index(req, res) {
        try {
            if(!req.session.teacher){
                return res.redirect('/loggin')
            }
            const teacherId = req.session.teacher
            
            let data_request = await content_project.find({
                teacherId: teacherId,
                statuss: 'request'
            })
            
            const requests = []
            for(let prj of data_request) {
                const student = await content_student.findById(prj.studentId)
                requests.push({
                    projectId: prj._id,
                    studentId: prj.studentId,
                    studentName: student ? student.fullName : 'Không rõ',
                    studentCode: student ? student.studentCode : '',
                    projectName: prj.inputProject,
                    date: prj.createdAt.toLocaleDateString('vi-VN')
                })
            }

            res.render('teacher/request', {
                layout: 'teacher/main',
                active: 'request',
                figure: 'teacher',
                requests: requests
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async getApproveForm(req, res) {
        try {
            if(!req.session.teacher) return res.redirect('/loggin')
            const projectId = req.params.id
            const project = await content_project.findById(projectId)
            if(!project) return res.redirect('/teacher/request')
            
            const teacherData = require('../../models/teacher')
            const teacher = await teacherData.findById(req.session.teacher)
            
            res.render('teacher/approveForm', {
                layout: 'teacher/main',
                active: 'request',
                figure: 'teacher',
                project: project.toObject(),
                teacherName: teacher.fullName
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi máy chủ')
        }
    }

    async approve(req, res) {
        try {
            const { 
                projectId, 
                teacherName, 
                projectName,
                contentProject,
                numberStudent,
                technology
            } = req.body
            
            const project = await content_project.findById(projectId)
            if(!project) return res.json({ success: false, message: 'Không tìm thấy yêu cầu' })
            
            project.statuss = 'active'
            project.numberSubmit = 0
            
            project.teacherInstruct = teacherName
            project.teacherFeedbackName = teacherName
            project.inputProject = projectName
            project.contentProject = contentProject
            project.numberStudent = numberStudent
            
            // Tự động tính 10 tuần (70 ngày) kể từ hiện tại
            const completionDate = new Date();
            completionDate.setDate(completionDate.getDate() + 70);
            project.date = completionDate;

            project.technology = technology ? technology.split(',').map(s=>s.trim()) : []
            
            await project.save()

            const student = await content_student.findById(project.studentId)
            if(student) {
                student.status = 'approved'
                await student.save()
            }

            // Requirements have been removed
            // Create progress
            const newProgress = new progressData({
                studentId: student._id,
                projectId: project._id,
                precent: 0
            })
            await newProgress.save()

            // Assignment
            const assignment = new assignmentData({
                studentId: student._id,
                teacherId: project.teacherId,
                projectId: project._id,
                role: 'reviewer',
            })
            await assignment.save()

            // Conversation
            const aconversation = new conversationData({
                studentId: student._id,
                teacherId: project.teacherId,
            })
            await aconversation.save()

            // Score
            const score = new scoreData({
                studentId: student._id,
                teacherId: project.teacherId,
                projectId: project._id,
                score: null,
                scoreFeedback: null,
                status: false,
            })
            await score.save()

            return res.json({ success: true, message: 'Khởi tạo đồ án thành công!' })
        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    async reject(req, res) {
        try {
            const { projectId } = req.body
            const project = await content_project.findById(projectId)
            if(!project) return res.json({ success: false, message: 'Không tìm thấy yêu cầu' })

            // Cập nhật lại Student thành trạng thái null để có quyền đăng ký lại
            const student = await content_student.findById(project.studentId)
            if(student) {
                student.status = undefined
                student.projectId = null
                student.teacherId = null
                await student.save()
            }

            // Xoá bản ghi Project Request
            await content_project.findByIdAndDelete(projectId)

            return res.json({ success: true, message: 'Đã từ chối Đồ án thành công.' })
        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}
module.exports = new requestController
