const content_project = require('../../models/project')
const content_account = require('../../models/account')

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
                figure: 'student',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new projectController