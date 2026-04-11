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
                layout: 'teacher/main',
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
            console.log('dữ liệu phản hồi:', studentId)
            const conversation = await conversationData.findOne({ teacherId: teacherId, studentId: studentId })


            console.log('dữ liệu:', conversation)

            if(!teacherContent){
                return res.status(400).json({ error: 'teacherContent is required' })
            }
            const newFeedback = new content_feedback({
                conversationId: conversation._id,
                contentId: conversation.teacherId,
                contentType: 'teacher',
                content: teacherContent,
            })
            await newFeedback.save()
            return res.json({ success: true, message: 'Feedback created' })
        }
        catch(err){
            console.log('Conversation not found:', err)
            console.error('Create error:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }
    async getStudent(req, res){
        try{
            const teacherId = req.session.teacher
            console.log('Teacher ID:', teacherId)
            const students = await StudentData.find({
                teacherId: teacherId,
                status: 'approved'
            })
            
            // Annotate students with unread flag and last message time for sorting
            let enrichedStudents = [];
            for (let stu of students) {
                const conversation = await conversationData.findOne({ studentId: stu._id, teacherId: teacherId });
                let unread = false;
                let lastTime = stu.createdAt;
                
                if (conversation) {
                    const unreadFeedback = await content_feedback.findOne({
                        conversationId: conversation._id,
                        contentType: 'student',
                        status: 'false'
                    });
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
        }
    }

    async getFeedbackStudent(req, res){
        try{
            const studentId = req.query.student
            const teacherId = req.session.teacher
            console.log('Student ID:', studentId)
            const conversation = await conversationData.find({ studentId: studentId, teacherId: teacherId })
            if(!conversation || conversation.length === 0){
                return res.status(404).json({ error: 'Conversation not found' })
            }
            console.log('Conversation:', conversation)
            let feedbacks = []
            for(let i=0; i<conversation.length; i++){
                const feedback = await content_feedback.find({ conversationId: conversation[i]._id })
                feedbacks = feedbacks.concat(feedback.map(item => item.toObject()))
            }
            if(feedbacks.length === 0){
                return res.status(404).json({ error: 'Feedback not found' })
            }
            res.json(feedbacks)
        }
        catch(err){
            console.log('Failed to get feedback:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }


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
            res.json({

                ...student.toObject(),
                feedbacks,
            })
        }
        catch(err){
            console.log('Failed to get feedback:', err)
            return res.status(500).json({ error: 'Server error' })
        }
    }
}

module.exports = new feedbackController
