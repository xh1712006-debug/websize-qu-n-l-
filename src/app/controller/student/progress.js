const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')

class progressController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/loggin')
            }
            const studentId = req.session.student
            let data = await progressData.find({ studentId: studentId })
            
            // Fallback calculation if no record exists
            if (data.length === 0) {
                const requirements = await requirementStudentData.find({ studentId: studentId })
                const total = requirements.length
                const completed = requirements.filter(r => r.status === 'completed').length
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                
                data.push({
                    percent: percent,
                    status: 'Đang thực hiện',
                    toObject: function() { return this; }
                })
            }

            data = data.map(item => item.toObject())
            res.render('student/progress', {
                layout: 'base',
                data: data,
                active: 'progress',
                figure: 'student',
            })
        }
        catch(err) {
            console.error(err)
            res.status(500).send('loi')
        }
    }
    async getProgress(req, res){
        try{
            const studentId = req.session.student
<<<<<<< HEAD:src/app/contraller/student/progress.js
            const report__Data = require('../../models/report')
            let [progress, reports, requirements] = await Promise.all([
                progressData.findOne({ studentId: studentId }),
                report__Data.find({ studentId: studentId }),
                requirementStudentData.find({ studentId: studentId })
            ])

            if (!progress) {
                const total = requirements.length
                const completed = requirements.filter(r => r.status === 'completed').length
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                progress = { percent: percent }
            }

            return res.json({
                progress: progress.toObject ? progress.toObject() : progress,
=======
            const progress = await progressData.findOne({
                studentId: studentId,
            })
            const report__Data = require('../../models/report')
            const reports = await report__Data.find({
                studentId: studentId,
            })
            return res.json({
                progress,
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/progress.js
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
