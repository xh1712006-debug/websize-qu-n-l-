const content_singger = require('../../models/student')
const content_teacher = require('../../models/teacher')

class singgerController{
    async index(req,res) {
        try {
            let data_singger = await content_singger.find()
            data_singger = data_singger.map(item => item.toObject())
            res.render('accounts/singger', {
                layout: 'accounts/main',
                active: 'singger',
                data_singger: data_singger,
                figure: 'singger',
                id: data_singger._id,
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

            const user = await content_singger.findOne({
                studentEmail: email,
                password: password,
            })

            console.log('data base được lưu id: ', user._id)

            const allUsers = await content_singger.find()
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
}



module.exports = new singgerController