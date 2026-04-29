const content_feedback = require('../../models/feedback')
const conversationData = require('../../models/conversation')
const teacherData = require('../../models/teacher')
const StudentData = require('../../models/student')

class feedbackController {
    async index(req, res) {
        try {
            if(!req.session.teacher) {
                return res.redirect('/loggin')
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
<<<<<<< HEAD:src/app/contraller/teacher/feedback.js
            }).select('fullName studentCode studentMajor studentClass projectId');
            
            let enrichedStudents = [];
            for (let stu of students) {
                const conversation = await conversationData.findOne({ studentId: stu._id, teacherId: teacherId });
                let unreadCount = 0;
                let lastMsg = null;
                
                if (conversation) {
                    unreadCount = await content_feedback.countDocuments({
=======
            })
            
            // Annotate students with unread flag and last message time for sorting
            let enrichedStudents = [];
            for (let stu of students) {
                const conversation = await conversationData.findOne({ studentId: stu._id, teacherId: teacherId });
                let unread = false;
                let lastTime = stu.createdAt;
                
                if (conversation) {
                    const unreadFeedback = await content_feedback.findOne({
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/feedback.js
                        conversationId: conversation._id,
                        contentType: 'student',
                        status: 'false'
                    });
<<<<<<< HEAD:src/app/contraller/teacher/feedback.js
                    
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
=======
                    if (unreadFeedback) unread = true;
                    
                    const latestMsg = await content_feedback.findOne({
                        conversationId: conversation._id
                    }).sort({ createdAt: -1 });
                    if (latestMsg) {
                        lastTime = latestMsg.createdAt;
                    }
                }
                let projectName = 'Chưa có đồ án';
                // Fetch project logic if projectId exists
                if (stu.projectId) {
                    const projectDataModel = require('../../models/project');
                    const project = await projectDataModel.findById(stu.projectId);
                    if (project) projectName = project.inputProject;
                }
                
                enrichedStudents.push({
                    ...stu.toObject(),
                    unread,
                    lastTime,
                    projectName
                });
            }
            
            // Sort: unread first, then by latest message naturally
            enrichedStudents.sort((a, b) => b.lastTime - a.lastTime);
            
            res.json(enrichedStudents)
        }
        catch(err){
            console.log('Failed to get student:', err)
            return res.status(500).json({ error: 'Server error' })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/feedback.js
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

<<<<<<< HEAD:src/app/contraller/teacher/feedback.js
            const feedbacks = await content_feedback.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
            
=======
    async getFeedback(req, res){
        try{
            const teacherId = req.session.teacher
            const studentId = req.query.studentId
            console.log('Teacher ID:', teacherId)
            console.log('Student ID:', studentId)

            // add student 
            const student = await StudentData.findById(studentId).select('fullName')
            console.log('Student:', student)
            if(!student){
                return res.status(404).json({ error: 'Student not found' })
            }

            const conversation = await conversationData.findOne({ teacherId: teacherId, studentId: studentId })
            if(!conversation){
                return res.status(404).json({ error: 'Conversation not found' })
            }
            console.log('ConversationID:', conversation)
            const feedbacks = await content_feedback.find({ conversationId: conversation._id }).sort({ createdAt: 1 })
            console.log('Feedbacks:', feedbacks)
            if(!feedbacks || feedbacks.length === 0){
                return res.status(404).json({ error: 'Feedback not found' })
            }
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/feedback.js
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
