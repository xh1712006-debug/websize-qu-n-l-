const content_account = require('../../models/account')
const content_singger = require('../../models/student')


class accountController{
    async index(req,res) {
        try {
            if(!req.session.student){
                return res.redirect('/accounts/singger')
            }
            const student = await content_singger.findById(req.session.student)
            console.log('session hiện tại:', req.session)
            console.log('student id trong session:', req.session.student)

            console.log('data được lưu:', student)
            console.log('data lưu: ', student)
            res.render('student/account', {
                layout: 'student/main',
                active: 'account',
                user: req.session.user,
                figure: 'student',
            })
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async getAccount(req, res) {
        try {
            const student = await content_singger.findById(req.session.student)
            res.json(student)
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
    }
    async upAccount(req, res) {
        try {
            const studentId = req.session.student
            const student = await content_singger.findById(studentId)
            const password = req.body.password

            console.log('mật khẩu student kiếm được: ', student)
            console.log('mật khẩu password kiếm được: ', password)

            student.password = password

            await student.save()
            res.json({ message: 'Đổi mật khẩu thành công' })


        }
        catch(err){
            console.log(err)
            res.status(500).json({ message: 'Lỗi update' })
        }
    }
}

module.exports = new accountController