const content_report = require('../../models/report')

class reportController {
    async index(req, res) {
        try {
            let data_report = await content_report.find()
            data_report = data_report.map(item => item.toObject())
            res.render('teacher/report', {
                layout: 'teacher/main',
                active: 'report',
                data_report: data_report,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new reportController