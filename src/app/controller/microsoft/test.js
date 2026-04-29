const studentData = require('../../models/student')
const teacherData = require('../../models/teacher')
const axios = require('axios')

class microsoftController {

    async index(req, res) {
        try {
            const clientId = process.env.CLIENT_ID
            const redirectUrl = process.env.REDIRECT_URI
            
            const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&response_mode=query&scope=openid%20profile%20email%20User.Read`

            res.redirect(url)
        }
        catch (err) {
            console.error(err)
            res.status(500).send('Lỗi chuyển hướng Microsoft')
        }
    }

    async callback(req, res) {
        try {
            const code = req.query.code
            console.log("Authorization Code:", code)

            const tokenResponse = await axios.post(
                'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                new URLSearchParams({
                    client_id: process.env.CLIENT_ID,                   
                    client_secret: process.env.CLIENT_SECRET,
                    code: code,
                    redirect_uri: process.env.REDIRECT_URI,
                    grant_type: 'authorization_code'
                }),
                {
                    headers:{
                        "Content-Type":"application/x-www-form-urlencoded"
                    }
                }
            )

            const access_token = tokenResponse.data.access_token
            
            const user = await axios.get(
                "https://graph.microsoft.com/v1.0/me",
                {
                    headers:{
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )
            console.log("User data:", user.data)

            const email = user.data.mail || user.data.userPrincipalName
            if (!email) {
                return res.status(400).send('Không tìm thấy email từ Microsoft')
            }

            if(email.includes('student')){
                console.log('Đăng nhập với vai trò: Sinh viên')
                
                let userStudent = await studentData.findOne({
                    studentEmail: email,
                })

                if(!userStudent){
                    const msv = email.split('@')[0]
                    userStudent = await studentData.create({
                        fullName: user.data.displayName,
                        givenName: user.data.givenName,
                        studentEmail: email,
                        phone: user.data.mobilePhone,
                        studentCode: msv,
                    })
                }

                req.session.student = userStudent._id
                req.session.role = 'student'

                if(userStudent.password){
                    return res.redirect('/student/dashboard')
                }
                
                res.redirect('/auth/reg')
            }
            else if(email.includes('teacher')){
                console.log('Đăng nhập với vai trò: Giáo viên')
                
                let userTeacher = await teacherData.findOne({
                    teacherEmail: email,
                })

                if(!userTeacher){
                    const tcode = email.split('@')[0]
                    userTeacher = await teacherData.create({
                        fullName: user.data.displayName,
                        teacherEmail: email,
                        phone: user.data.mobilePhone,
                        teacherCode: tcode,
                        role: 'teacher',
                        status: 'active'
                    })
                }

                req.session.teacher = userTeacher._id
                req.session.role = 'teacher'

                if(userTeacher.password){
                    return res.redirect('/teacher/dashboard')
                }
                
                res.redirect('/auth/reg')
            }
            else {
                res.status(403).send('Email không hợp lệ (không phải sinh viên hoặc giáo viên)')
            }

        } catch (err) {
            console.error(err.response?.data || err)
            res.status(500).send('Lỗi xử lý callback từ Microsoft')
        }
    }

}

module.exports = new microsoftController
