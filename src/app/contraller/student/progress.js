const Content = require('../../models/progress')

class progressController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            let data = await Content.find()
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
}

module.exports = new progressController