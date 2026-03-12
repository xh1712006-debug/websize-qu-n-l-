const content_student = require('../../models/account')

class studentController {
    async index(req, res) {
        try {
            let data_student = await content_student.find()
            data_student = data_student.map(item => item.toObject())
            res.render('teacher/student', {
                layout: 'teacher/main',
                active: 'student',
                data_student: data_student,
                figure: 'teacher',
            })
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }
}

module.exports = new studentController