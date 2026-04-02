const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')

class progressController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
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
            console.log('progress: ', progress)
            const requirementStudent = await requirementStudentData.find({
                studentId: studentId,
            })
            console.log('requirementStudent: ', requirementStudent)
            return res.json({
                progress,
                requirementStudent,
            })

        }
        catch(err){

        }
    }
}

module.exports = new progressController