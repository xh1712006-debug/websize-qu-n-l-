const content_project = require('../../models/project')
const content_teacher = require('../../models/teacher')

class topicController {
    async index(req, res) {
        try {
            if(!req.session.teacher){
                return res.redirect('/accounts/singger')
            }
            const teacherId = req.session.teacher
            
            // Get all topics created by this teacher
            let data_topic = await content_project.find({
                teacherId: teacherId,
                statuss: 'template'
            })
            
            res.render('teacher/topic', {
                layout: 'base',
                active: 'topic',
                figure: 'teacher',
                data_topic: data_topic.map(doc => doc.toObject())
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async addTopic(req, res) {
        try {
            if(!req.session.teacher) return res.json({ success: false, message: 'Chưa đăng nhập' })
            
            const teacherId = req.session.teacher
            const projectName = req.body.projectName

            if(!projectName) return res.json({ success: false, message: 'Thiếu tên đồ án' })

            const teacher = await content_teacher.findById(teacherId)

            const newTopic = new content_project({
                teacherId: teacherId,
                inputProject: projectName,
                statuss: 'template',
                teacherFeedbackId: teacherId,
                teacherFeedbackName: teacher.fullName
            })

            await newTopic.save()
            return res.json({ success: true, message: 'Đã thêm đề tài gợi ý thành công' })

        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }

    async deleteTopic(req, res) {
        try {
            if(!req.session.teacher) return res.json({ success: false, message: 'Chưa đăng nhập' })
            const { topicId } = req.body
            
            await content_project.findByIdAndDelete(topicId)
            return res.json({ success: true, message: 'Đã xoá đề tài thành công' })
            
        } catch(err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}
module.exports = new topicController
