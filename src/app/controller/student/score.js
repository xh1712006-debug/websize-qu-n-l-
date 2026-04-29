const scoreData = require('../../models/grade')
const studentData = require('../../models/student')
const projectData = require('../../models/project')
const progressData = require('../../models/progress')
const teacherData = require('../../models/teacher')

class scoreController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/loggin')
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
            
            let kq = 'Chưa có điểm';
            let statusText = 'Chưa có điểm';
            let color = 'bg-gray-400';
            let precent = 0;
            
            let tScore = (score && score.score !== undefined && score.score !== null) ? score.score : 'Chưa có';
            let rScore = (score && score.scoreFeedback !== undefined && score.scoreFeedback !== null) ? score.scoreFeedback : 'Chưa có';
            
            if (tScore !== 'Chưa có' && rScore !== 'Chưa có') {
                kq = ((tScore + rScore)/2).toFixed(1);
                precent = kq * 10;
                
                if (kq >= 8.5) {
                    statusText = 'Tốt';
                    color = 'bg-blue-500';
                } else if (kq >= 7) {
                    statusText = 'Khá';
                    color = 'bg-green-500';
                } else if (kq >= 5) {
                    statusText = 'Trung bình';
                    color = 'bg-yellow-500';
                } else {
                    statusText = 'Yếu';
                    color = 'bg-red-500';
                }
            } else {
                kq = 'Chưa có điểm';
                precent = 0;
            }
            
            data.push({
                fullName: student.fullName,
                projectName: project ? project.inputProject : 'Chưa có đồ án',
                teacherName: teacher ? teacher.fullName : 'Chưa có giảng viên',
                score: tScore,
                studentCode: student.studentCode,
                scoreFeedback: rScore,
                precent: Math.round(precent),
                result: kq,
                status: statusText,
                color: color,
                comment: (score && score.comment) ? score.comment : 'Chưa có nhận xét nào từ hội đồng.',
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
