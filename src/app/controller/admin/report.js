const content_admin = require('../../models/admin')

class reportController{
    async index(req,res) {
        try {
            res.render('admin/report', {
                layout: 'admin/main',
                figure: 'admin',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new reportController
