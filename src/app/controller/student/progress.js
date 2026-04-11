const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')

class progressController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/loggin')
            }
            let data = await progressData.find()
            data = data.map(item => item.toObject())
            res.render('student/progress', {
                layout: 'student/main',
                data: data,
                active: 'progress',
                figure: 'student',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async getProgress(req, res){
        try{
            const studentId = req.session.student
            const progress = await progressData.findOne({
                studentId: studentId,
            })
            const report__Data = require('../../models/report')
            const reports = await report__Data.find({
                studentId: studentId,
            })
            return res.json({
                progress,
                reports,
            })
        }
        catch(err){
            console.log(err)
            res.status(500).json({ error: 'Lỗi' })
        }
    }
}

module.exports = new progressController
