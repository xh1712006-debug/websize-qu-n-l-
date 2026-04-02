const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')

class scoreController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }

            const data = []
            const studentId = req.session.student
            const student = await studentData.findById(studentId)
            const project = await projectData.findOne({
                _id: student.projectId,
            })
            const teacher = await teacherData.findById(student.teacherId)
            const score = await scoreData.findOne({
                studentId: studentId,
            })
            const progress = await progressData.findOne({
                studentId: studentId,
            })
            let kq = ((score.score+score.scoreFeedback)/2).toFixed(1)
            if(score.status == 'false') {
                kq = 'Chưa có điểm'
            }
            
            
            
            data.push({
                fullName: student.fullName,
                projectName: project.inputProject,
                teacherName: teacher.fullName,
                score: score.score && score.status =='true' ? score.score : 'Chưa có điểm',
                studentCode: student.studentCode,
                scoreFeedback: score.scoreFeedback && score.status =='true' ? score.scoreFeedback : 'Chưa có phản biện',
                precent: kq*10,
                result: kq,
                status: kq >= 8.5 ? 'tốt' : kq >= 7 ? 'khá' : kq >= 5 ? 'trung bình' : 'yếu',
                color: kq >= 8.5 ? 'bg-blue-500' : kq >= 7 ? 'bg-green-500' : kq >= 5 ? 'bg-yellow-500' : 'bg-red-500',
                comment: score.comment ? score.comment : 'Chưa có nhận xét',
            })

            res.render('student/score', {
                layout: 'student/main',
                data: data,
                active: 'score',
                figure: 'student',
            })
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new scoreController