const studentData = require('../../models/student')


class microsoftController{
    async index(req,res) {
        try {
            res.render('microsoft/reg', {
                layout: 'microsoft/main',
                figure: 'microsoft',
                active: 'reg'
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }

    async postPassword(req, res){
        try {
            const studentId = req.session.student
            console.log('studentId: ', studentId)
            const password = req.body.password
            console.log('mật khẩu vửa nhập: ', password)
            await studentData.findByIdAndUpdate({
                _id: studentId,
            },{
                password: password,
            })
            console.log('gửi yêu cầu thành công')
            // return res.redirect('/auth/microsoft')
        }
        catch(err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }
}

module.exports = new microsoftController