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
            let data_feedback = await content_feedback.find()
            data_feedback = data_feedback.map(item => item.toObject())
            res.render('student/feedback', {
                layout: 'student/main',
                data_feedback: data_feedback,
                active: 'feedback',
                figure: 'student',
            })
        }
        catch(err) {
            res.status(500).send('loi')
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

            const conversation = new contentConversation({
                studentId: studentId,
                teacherId: teacherId,
            })
            await conversation.save()
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
            const conversation = await contentConversation.findOne({ studentId: studentId })

            
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' })
            }
            const feedback = new content_feedback({
                conversationId: conversation._id,
                contentId: studentId,
                contentType: 'student',
                content: content,
            })
            await feedback.save()
            return res.json({ success: true, message: 'Feedback posted' })
        }
        catch(err) {
            console.error('Post message error:', err)
            return res.status(500).json({ error: 'Server error' })
        } 
    }


    async getFeedback(req, res) {
        try {
            const studentId = req.session.student
            const conversation = await contentConversation.findOne({ studentId: studentId })
            console.log('conversation:', conversation)
            const teacher = await teacherData.findOne({
                _id: conversation.teacherId,
            }).select('fullName')
            console.log('teacher:', teacher)
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' })
            }
            const feedbacks = await content_feedback.find({ conversationId: conversation._id }).sort({ createdAt: 1 })

            return res.json({
                ...teacher.toObject(),
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