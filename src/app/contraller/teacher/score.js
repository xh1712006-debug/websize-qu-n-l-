const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const requirmentStudentData = require('../../models/requirementStudent')
const progressData = require('../../models/progress')

class scoreController {
    async index(req, res) {
        try {
            res.render('teacher/score', {
                layout: 'teacher/main',
                active: 'score',
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }

    async getScore(req,res){
        try {
            const data = []
            const teacherId = req.session.teacher
            console.log(teacherId)
            const student = await studentData.find({teacherId: teacherId})
            console.log('student: ', student)
            for (const stu of student) {
                const project = await projectData.findById(stu.projectId)
                console.log('project: ', project)
                const progress = await progressData.findOne({studentId: stu._id})
                console.log('progress: ', progress)
                const score = await scoreData.findOne({studentId: stu._id})
                
                data.push({
                    id: score ? score._id : null,
                    fullName: stu.fullName,
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.precent : 'Không có tiến độ',
                    score: score ? score.score : 'Chưa có điểm',
                    status: progress.precent >= 80 ? true : false,
                })
            }
            console.log('data: ', data)
            return res.json(data)
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }

    async postScore(req, res){
        try{
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
            const soce = await scoreData.findOneAndUpdate({
                _id: scoreId,
            }, {
                score: score,
                comment: comment,
            }, {
                new: true,
            })
            return res.json({message: 'Điểm đã được thêm'})
        }  
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new scoreController