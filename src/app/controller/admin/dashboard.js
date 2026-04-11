const content_admin = require('../../models/admin')

class dashboardController{
    async index(req,res) {
        try {
            res.render('admin/dashboard', {
                layout: 'admin/main',
                figure: 'admin',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new dashboardController
