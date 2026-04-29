const content_feedback = require('../../models/feedback')
const contentStudent = require('../../models/student')
const contentConversation = require('../../models/conversation')
const contentProject = require('../../models/project')
const teacherData = require('../../models/teacher')

class feedbackController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)
            
            // Tìm cuộc trò chuyện và lấy thông tin giáo viên ngay từ đầu
            const conversation = await contentConversation.findOne({ studentId: studentId })
            
            let teacherName = 'Chưa có giảng viên';
            if (student && student.teacherId) {
                const teacher = await teacherData.findById(student.teacherId);
                if (teacher) teacherName = teacher.fullName;
            } else if (conversation && conversation.teacherId) {
                const teacher = await teacherData.findById(conversation.teacherId);
                if (teacher) teacherName = teacher.fullName;
            }

            let data_feedback = []
            if (conversation) {
                await content_feedback.updateMany(
                    {
                        conversationId: conversation._id,
                        contentType: 'teacher',
                        status: 'false'
                    },
                    {
                        status: 'true',
                })
                
                data_feedback = await content_feedback.find({ conversationId: conversation._id })
            }

            data_feedback = data_feedback.map(item => item.toObject())
            res.render('student/feedback', {
                layout: 'base',
                data_feedback: data_feedback,
                active: 'feedback',
                figure: 'student',
                teacherName: teacherName // Gửi tên giáo viên trực tiếp qua SSR
            })
        }
        catch(err) {
            console.error('Feedback index error:', err)
            res.status(500).send('Lỗi máy chủ')
        }
    }
    async createFeedback(req, res) {
        try {
            
            const content = req.body.content
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)

            const teacherId = student.teacherId

            console.log('dữ liệu studentId:', studentId)
            console.log('dữ liệu teacherId:', teacherId)

            // const conversation = new contentConversation({
            //     studentId: studentId,
            //     teacherId: teacherId,
            // })
            // await conversation.save()
            return res.json({ success: true, message: 'Conversation created' })
        }
        catch(err) {
            console.error('Create error:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }
    async postMessage(req, res) {
        try {
            const content = req.body.content
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)

            if (!student) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin sinh viên' })
            }

            // Tìm hoặc Tự động tạo cuộc trò chuyện nếu chưa có
            let conversation = await contentConversation.findOne({ studentId: studentId })
            
            if (!conversation && student.teacherId) {
                conversation = new contentConversation({
                    studentId: studentId,
                    teacherId: student.teacherId,
                })
                await conversation.save()
            }

            if (!conversation) {
                return res.status(404).json({ error: 'Bạn cần đăng ký giảng viên hướng dẫn trước khi trao đổi' })
            }

            const feedback = new content_feedback({
                conversationId: conversation._id,
                contentId: studentId,
                contentType: 'student',
                content: content,
            })
            await feedback.save()
            return res.json({ success: true, message: 'Gửi tin nhắn thành công' })
        }
        catch(err) {
            console.error('Post message error:', err)
            return res.status(500).json({ error: 'Lỗi hệ thống khi gửi tin' })
        } 
    }

    async getFeedback(req, res) {
        try {
            const studentId = req.session.student
            const student = await contentStudent.findById(studentId)
            const conversation = await contentConversation.findOne({ studentId: studentId })
            
            if (!conversation) {
                // Trả về mảng rỗng thay vì lỗi 404 để client không bị gián đoạn polling
                let teacherName = 'N/A';
                if (student && student.teacherId) {
                    const teacher = await teacherData.findById(student.teacherId).select('fullName')
                    if (teacher) teacherName = teacher.fullName
                }
                return res.json({ fullName: teacherName, feedbacks: [] })
            }

            let teacher = null;
            if (student && student.teacherId) {
                teacher = await teacherData.findById(student.teacherId).select('fullName')
            } else if (conversation.teacherId) {
                teacher = await teacherData.findById(conversation.teacherId).select('fullName')
            }
            
            const feedbacks = await content_feedback.find({ conversationId: conversation._id }).sort({ createdAt: 1 })

            return res.json({
                fullName: teacher ? teacher.fullName : 'N/A',
                feedbacks,
            })
        }
        catch(err) {
            console.error('Get error:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }
    // async deleteFeedback(req, res) {
    //     try {
    //         const id = req.params.id || req.body.id
    //         // if (!id) return res.status(400).json({ error: 'Missing id' })

    //         const deleted = await content_feedback.findByIdAndDelete(id)
    //         // if (!deleted) return res.status(404).json({ error: 'Feedback not found' })

    //         return res.json({ success: true })
    //     } catch (err) {
    //         console.error('Delete error:', err)
    //         return res.status(500).json({ error: 'Server error' })
    //     }
    // }
}

module.exports = new feedbackController