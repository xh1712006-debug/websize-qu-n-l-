const content_admin = require('../../models/admin')
const studentData = require('../../models/student')

class studentController{
    async index(req,res) {
        try {
            res.render('admin/student', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/index'
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async getStudent(req, res){
        const student = await studentData.find()
        return res.json(student)
    }
}

module.exports = new studentController