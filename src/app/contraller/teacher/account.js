const content_account = require('../../models/account')
const teacherData = require('../../models/teacher')

class AccountController {
    async index(req, res) {
        try {
            let data_account = await content_account.find()
            data_account = data_account.map(item => item.toObject())
            res.render('teacher/account', {
                layout: 'teacher/main',
                active: 'account',
                data_account: data_account,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }
    async getTeacher(req, res){
        const teacherId = req.session.teacher
        const teacher = await teacherData.findById({
            _id: teacherId,
        }).select('fullName teacherEmail degree role department')
        

    }
}

module.exports = new AccountController