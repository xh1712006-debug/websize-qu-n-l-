const content_project = require('../../models/project')
const content_account = require('../../models/account')
const content_student = require('../../models/student')
const content_teacher = require('../../models/teacher')
const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')
const reportData = require('../../models/report')

class projectController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            let data_project = await content_project.find()
            let data_account = await content_account.find()
            data_project = data_project.map(item => item.toObject())
            data_account = data_account.map(item => item.toObject())
            res.render('student/project', {
                layout: 'student/main',
                data_project: data_project,
                data_account: data_account,
                active: 'project',
                figure: 'student',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async getProject(req, res){
        const studentId = req.session.student
        console.log('studentID: ', studentId)
        const student = await content_student.findById(studentId)
        console.log('projectId: ', student.projectId)
        const project = await content_project.findById(student.projectId)
        const teacher = await content_teacher.findById(student.teacherId)
        const progress = await progressData.findOne({
            studentId: studentId,
        })
        const requirementStudent = await requirementStudentData.find({
            studentId: studentId,
        })
        const report = await reportData.find({
            studentId: studentId,
        })

        console.log('project: ', project)
        return res.json({
            teacher,
            student,
            project,
            requirementStudent,
            progress,
            report,
        })
    }
}

module.exports = new projectController