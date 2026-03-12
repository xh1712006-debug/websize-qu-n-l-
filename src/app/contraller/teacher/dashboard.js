const content_dashboard = require('../../models/dashboard')

class DashboardController {
    async index(req, res) {
        try {
            
            let data_dashboard = await content_dashboard.find()
            data_dashboard = data_dashboard.map(item => item.toObject())
            res.render('teacher/dashboard', {
                layout: 'teacher/main',
                active: 'dashboard',
                data_dashboard: data_dashboard,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new DashboardController