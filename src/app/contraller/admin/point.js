const content_admin = require('../../models/admin')

class pointController{
    async index(req,res) {
        try {
            res.render('admin/point', {
                layout: 'admin/main',
                figure: 'admin',
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new pointController