const studentData = require('../../models/student')
const teacherData = require('../../models/teacher')
const axios = require('axios')

class microsoftController {

    async index(req, res) {
        try {
            const clientId = '3a9bfba0-264d-4637-bb62-f84f32ea413b'
            const redirectUrl = 'http://localhost:3000/auth/microsoft/callback'
            
            const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUrl}&response_mode=query&scope=openid%20profile%20email%20User.Read`

            res.redirect(url)
        }
        catch (err) {
            res.status(500).send('loi')
        }
    }

    async callback(req, res) {
        try {

            const code = req.query.code

            console.log("Authorization Code:", code)

            const tokenResponse = await axios.post(
                'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                new URLSearchParams({
                    // mã số đơn hàng
                    client_id: '3a9bfba0-264d-4637-bb62-f84f32ea413b',                   
                    CLIENT_SECRET: 'ZVU8Q~CwaQZzqQwcQGNgZUg1tMQ1J8CaZrrJ9dx6',
                    code: code,
                    redirect_uri: 'http://localhost:3000/auth/microsoft/callback',
                    grant_type: 'authorization_code'
                }),
                {
                    headers:{
                        "Content-Type":"application/x-www-form-urlencoded"
                    }
                }
            )

            
            const access_token = tokenResponse.data.access_token
            console.log('access_token: ',access_token)
            
            const user = await axios.get(
                "https://graph.microsoft.com/v1.0/me",
                {
                    headers:{
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )
            console.log("User data:", user.data)

            

            if(user.data.mail.includes('student')){
                console.log('đây là học sinh')
                
                let userStudent = await studentData.findOne({
                    studentEmail: user.data.mail,
                })
                if(!userStudent){
                    const msv = user.data.mail.split('@')[0]
                    userStudent = await studentData.create({
                        // id: user.data.id,
                        fullName: user.data.displayName,
                        givenName: user.data.givenName,
                        studentEmail: user.data.mail,
                        phont: user.data.mobilePhone,
                        studentCode: msv,
                    })
                }
                req.session.student = userStudent._id
                if(userStudent.password){
                    return res.redirect('/student/dashboard')
                }
                
                console.log(req.session.student)

                res.redirect('/auth/reg')
            }
            if(user.data.mail.includes('teacher')){
                console.log('đây là giáo viên')
                res.redirect('/teacher/dashboard')
            }


        } catch (err) {
            console.log(err.response?.data || err)
            res.status(500).send('lỗi callback')
        }
    }

}

module.exports = new microsoftController