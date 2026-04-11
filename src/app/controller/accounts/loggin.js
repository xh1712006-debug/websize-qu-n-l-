const content_loggin = require('../../models/student')
const content_teacher = require('../../models/teacher')

class logginController{
    async index(req,res) {
        try {
            let data_loggin = await content_loggin.find()
            data_loggin = data_loggin.map(item => item.toObject())
            res.render('accounts/loggin', {
                layout: 'accounts/main',
                active: 'loggin',
                data_loggin: data_loggin,
                figure: 'loggin',
                id: data_loggin._id,
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    
    async send(req, res) {
        try{
            console.log(req.body)
            const email = req.body.email
            const password = req.body.password

            console.log(email, password)

            const user = await content_loggin.findOne({
                studentEmail: email,
                password: password,
            })

            console.log('data base được lưu id: ', user._id)

            const allUsers = await content_loggin.find()
            console.log("TẤT CẢ USER TRONG DB:", allUsers)

            if (!user) {
            return res.send('Sai tài khoản hoặc mật khẩu')
            }

            req.session.student = user._id

            
            // 🔥 LƯU SESSION Ở ĐÂY
            req.session.user = {
                id: user._id,
                fullName: user.fullName,
                studentCode: user.studentCode,
                studentEmail: user.studentEmail,
                StudentClass: user.StudentClass,
                major: user.major
            }

            return res.json({ success: true })

        }
         catch (err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }
    async sendTeacher(req, res) {
        try{
            console.log(req.body)
            const email = req.body.email
            const password = req.body.password

            console.log(email, password)

            const user = await content_teacher.findOne({
                teacherEmail: email,
                teacherCode: password,
            })

            console.log('data base được lưu id: ', user._id)

            const allUsers = await content_teacher.find()
            console.log("TẤT CẢ USER TRONG DB:", allUsers)

            if (!user) {
            return res.send('Sai tài khoản hoặc mật khẩu')
            }

            req.session.teacher = user._id

            
            // 🔥 LƯU SESSION Ở ĐÂY
            req.session.userT = {
                id: user._id,
                fullName: user.fullName,
                teacherCode: user.teacherCode,
                teacherEmail: user.teacherEmail,
                teacherClass: user.teacherClass,
                major: user.major
            }

            return res.json({ success: true })

        }
         catch (err) {
            console.log(err)
            res.status(500).send('Lỗi server')
        }
    }

    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if(err) {
                    console.log('Error destroying session:', err);
                }
                res.redirect('/loggin');
            });
        } catch (err) {
            console.log(err);
            res.redirect('/loggin');
        }
    }
}



module.exports = new logginController
