const content_admin = require('../../models/admin')

class studentController{
    async index(req,res) {
        try {
            res.render('admin/student', {
                layout: 'admin/main',
                figure: 'admin',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new studentController