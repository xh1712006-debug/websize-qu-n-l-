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
                    studentId: stu._id,
                    projectId: project ? project._id : null,
                    fullName: stu.fullName,
                    projectName: project ? project.inputProject : 'Không có dự án',
                    progress: progress ? progress.precent : 'Không có tiến độ',
                    score: (score && score.score) ? score.score : 'Chưa có điểm',
                    status: (progress && progress.precent >= 100) ? true : false,
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
            const studentId = req.body.studentId === 'null' ? null : req.body.studentId;
            const projectId = req.body.projectId === 'null' ? null : req.body.projectId;
            const score = req.body.score;
            const comment = req.body.comment;
            
            if (!studentId) {
                return res.status(400).json({ error: "Missing studentId" });
            }
            
            const statius = await scoreData.findOne({studentId: studentId})
            if(statius && statius.status === 'approved') {
                return res.json({message: 'Điểm đã được chốt, không thể mửa'});
            }
            
            const soce = await scoreData.findOneAndUpdate({
                studentId: studentId,
            }, {
                projectId: projectId,
                teacherId: req.session.teacher,
                score: score,
                comment: comment,
            }, {
                new: true,
                upsert: true,
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
