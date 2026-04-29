const content_singger = require('../../models/student')
const projectData = require('../../models/project')
const reportData = require('../../models/report')
const feedbackData = require('../../models/feedback')
const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')

class accountController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            const studentId = req.session.student
            const student = await content_singger.findById(studentId)
            
            // Calculate Stats
            const [project, reports, requirements, feedbacks] = await Promise.all([
                projectData.findOne({ studentId: studentId, statuss: 'active' }),
                reportData.find({ studentId: studentId }),
                requirementStudentData.find({ studentId: studentId }),
                feedbackData.countDocuments({ contentId: studentId, status: 'false' }) // Unread feedbacks
            ])

            // Calculate Progress
            let progressPercent = 0
            const progress = await progressData.findOne({ studentId: studentId })
            if (progress) {
                progressPercent = progress.percent
            } else {
                const total = requirements.length
                const completed = requirements.filter(r => r.status === 'completed').length
                progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
            }

            res.render('student/account', {
                layout: 'base',
                active: 'account',
                user: student ? student.toObject() : {},
                figure: 'student',
                stats: {
                    progress: progressPercent,
                    reportsCount: reports.length,
                    feedbackCount: feedbacks,
                    hasProject: !!project
                }
            })
        } catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async getAccount(req, res) {
        try {
            const student = await content_singger.findById(req.session.student)
            res.json(student)
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async upAccount(req, res) {
        try {
            const studentId = req.session.student
            const { currentPassword, newPassword } = req.body
            const student = await content_singger.findById(studentId)

            if (student.password !== currentPassword) {
                return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' })
            }

            student.password = newPassword
            await student.save()
            res.json({ success: true, message: 'Đổi mật khẩu thành công' })
        }
        catch(err){
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi cập nhật mật khẩu' })
        }
    }

    async updateContact(req, res) {
        try {
            const studentId = req.session.student
            if(!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' })
            
            const { studentPhone, studentEmail } = req.body
            await content_singger.findByIdAndUpdate(studentId, { studentPhone, studentEmail })
            
            return res.json({ success: true, message: 'Cập nhật thông tin thành công' })
        } catch (err) {
            console.log(err)
            res.status(500).json({ success: false, message: 'Lỗi server' })
        }
    }
}

module.exports = new accountController