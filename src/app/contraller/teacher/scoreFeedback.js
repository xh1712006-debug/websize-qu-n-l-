const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const requirmentStudentData = require('../../models/requirementStudent')
const progressData = require('../../models/progress')
const assignmentData = require('../../models/assignment')

class scoreFeedbackController {
    async index(req, res) {
        try {
            res.render('teacher/scoreFeedback', {
                layout: 'teacher/main',
                active: 'scoreFeedback',
                figure: 'teacher',

            })
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async getScoreFeedback(req, res) {
        try {
            const teacherId = req.session.teacher
            const assignment = await assignmentData.find({ teacherId: teacherId })
            console.log('assignment: ', assignment)
            const data = []
            // console.log('assignment.studentId: ', assignment.studentId)
            // const student = await studentData.findById(assignment.studentId)
            // console.log('student: ', student)
            for (const stu of assignment) {
                const student = await studentData.findById(stu.studentId)
                console.log('student: ', student)
                const project = await projectData.findById(stu.projectId)
                console.log('project: ', project)
                const progress = await progressData.findOne({ studentId: stu.studentId })
                console.log('progress: ', progress)
                const score = await scoreData.findOne({ studentId: stu.studentId })
                console.log('score: ', score)

                data.push({
                    id: score ? score._id : null,
                    fullName: student ? student.fullName : 'Không có thông tin',
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.precent : 'Không có tiến độ',
                    score: score ? score.scoreFeedback : 'Chưa có điểm',
                    status: progress.precent >= 80 ? true : false,
                })
                
            }
            console.log('data Feedback: ', data)
            return res.json(data)
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async postScoreFeedback(req, res) {
        try {
            const scoreId = req.body.scoreId
            const score = req.body.score
            const comment = req.body.comment
            const statius = await scoreData.findOne({_id: scoreId})
                if(statius.status) {
                    return;
                }
            console.log('scoreId: ', scoreId)
            console.log('score: ', score)
            console.log('comment: ', comment)
            const scoreFeedback = await scoreData.findOneAndUpdate({
                _id: scoreId,
            }, {
                scoreFeedback: score,
            }, { new: true })
            console.log('scoreFeedback: ', scoreFeedback)
            return res.json({
                message: 'Điểm đã được thêm'
            })
            
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new scoreFeedbackController