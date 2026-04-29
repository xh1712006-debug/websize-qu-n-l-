const content_project = require('../../models/project')

class projectController {
    async index(req, res) {
        try {
            let data_project = await content_project.find()
            data_project = data_project.map(item => item.toObject())
            res.render('teacher/project', {
                layout: 'base',
                active: 'project',
                data_project: data_project,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new projectController