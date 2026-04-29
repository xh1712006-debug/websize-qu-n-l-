const content_feedback = require('../../models/feedback')
const conversationData = require('../../models/conversation')
const teacherData = require('../../models/teacher')
const StudentData = require('../../models/student')

class feedbackController {
    async index(req, res) {
        try {
            if(!req.session.teacher) {
                return res.redirect('/accounts/singger')
            }
            let data_feedback = await content_feedback.find()
            data_feedback = data_feedback.map(item => item.toObject())
            res.render('teacher/feedback', {
                layout: 'base',
                active: 'feedback',
                data_feedback: data_feedback,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }

   
    async postFeedback(req, res){
        try{
            const teacherContent = req.body.teacherContent
            const teacherId = req.session.teacher
            const studentId = req.query.studentId
            
            if (!studentId || !teacherContent) {
                return res.status(400).json({ error: 'Missing data' })
            }

            const conversation = await conversationData.findOne({ teacherId: teacherId, studentId: studentId })

            if(!conversation){
                return res.status(404).json({ error: 'Conversation not found' })
            }

            const newFeedback = new content_feedback({
                conversationId: conversation._id,
                contentId: teacherId,
                contentType: 'teacher',
                content: teacherContent,
            })
            await newFeedback.save()
            return res.json({ success: true, message: 'Feedback created' })
        }
        catch(err){
            console.error('postFeedback error:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }
    async getStudent(req, res) {
        try {
            const teacherId = req.session.teacher;
            const students = await StudentData.find({
                teacherId: teacherId,
                status: 'approved'
            }).select('fullName studentCode studentMajor studentClass projectId');
            
            let enrichedStudents = [];
            for (let stu of students) {
                const conversation = await conversationData.findOne({ studentId: stu._id, teacherId: teacherId });
                let unreadCount = 0;
                let lastMsg = null;
                
                if (conversation) {
                    unreadCount = await content_feedback.countDocuments({
                        conversationId: conversation._id,
                        contentType: 'student',
                        status: 'false'
                    });
                    
                    lastMsg = await content_feedback.findOne({
                        conversationId: conversation._id
                    }).sort({ createdAt: -1 });
                }

                enrichedStudents.push({
                    ...stu.toObject(),
                    unreadCount,
                    lastMessage: lastMsg ? (lastMsg.content.length > 40 ? lastMsg.content.substring(0, 40) + '...' : lastMsg.content) : 'Chưa có cuộc trò chuyện',
                    lastMsgTime: lastMsg ? lastMsg.createdAt : stu.createdAt
                });
            }
            
            // Sắp xếp: có tin nhắn chưa đọc lên đầu, sau đó theo thời gian mới nhất
            enrichedStudents.sort((a, b) => {
                if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
                return new Date(b.lastMsgTime) - new Date(a.lastMsgTime);
            });
            
            res.json(enrichedStudents);
        } catch (err) {
            console.error('getStudent error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getFeedback(req, res) {
        try {
            const teacherId = req.session.teacher;
            const studentId = req.query.studentId;
            
            const student = await StudentData.findById(studentId).select('fullName studentCode studentClass studentMajor');
            if (!student) return res.status(404).json({ error: 'Student not found' });

            const conversation = await conversationData.findOne({ teacherId: teacherId, studentId: studentId });
            if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
            
            // Đánh dấu tin nhắn là đã đọc
            await content_feedback.updateMany(
                {
                    conversationId: conversation._id,
                    contentType: 'student',
                    status: 'false'
                },
                { status: 'true' }
            );

            const feedbacks = await content_feedback.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
            
            res.json({
                ...student.toObject(),
                feedbacks,
            });
        } catch (err) {
            console.error('getFeedback error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new feedbackController