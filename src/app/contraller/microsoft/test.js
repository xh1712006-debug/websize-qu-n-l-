const studentData = require('../../models/student')
const teacherData = require('../../models/teacher')
const axios = require('axios')

class microsoftController {

    async index(req, res) {
        try {
            const clientId = process.env.CLIENT_ID
            const redirectUrl = process.env.REDIRECT_URI
            
            const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&response_mode=query&scope=openid%20profile%20email%20User.Read`

            res.redirect(url)
        }
        catch (err) {
            console.error('Login Redirect Error:', err)
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
            console.log('access_token: ', access_token)
            
            const user = await axios.get(
                "https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName,mobilePhone,department,jobTitle,officeLocation",
                {
                    headers:{
                        Authorization: `Bearer ${access_token}`
                    }
                }
            )
            console.log("Truy xuất dữ liệu Microsoft thành công:", user.data.displayName)

            const email = user.data.mail || user.data.userPrincipalName

            if(email && email.toLowerCase().includes('teacher')){
                console.log('Vai trò: Giảng viên')

                let userTeacher = await teacherData.findOne({
                    teacherEmail: email,
                })

                if(!userTeacher){
                    const gvCode = email.split('@')[0]
                    const tMajor = user.data.department || user.data.jobTitle || 'Kỹ thuật phần mềm'
                    userTeacher = await teacherData.create({
                        fullName: user.data.displayName,
                        teacherEmail: email,
                        teacherCode: gvCode,
                        teacherPhone: user.data.mobilePhone || '',
                        teacherMajor: tMajor, 
                        isMicrosoft: true, // [NEW] Đánh dấu tài khoản Microsoft
                    })
                } else {
                    // Chỉ cập nhật nếu dữ liệu hiện tại đang trống hoặc "Chưa cập nhật"
                    let updated = false
                    if ((!userTeacher.fullName || userTeacher.fullName === 'Chưa cập nhật') && user.data.displayName) {
                        userTeacher.fullName = user.data.displayName; updated = true;
                    }
                    if ((!userTeacher.teacherPhone || userTeacher.teacherPhone === 'Chưa cập nhật') && user.data.mobilePhone) {
                        userTeacher.teacherPhone = user.data.mobilePhone; updated = true;
                    }
                    if ((!userTeacher.teacherDepartment || userTeacher.teacherDepartment === 'Chưa cập nhật')) {
                        const tDept = user.data.department || user.data.jobTitle;
                        if (tDept) {
                            userTeacher.teacherDepartment = tDept; updated = true;
                        }
                    }
                    if (!userTeacher.isMicrosoft) {
                        userTeacher.isMicrosoft = true; updated = true;
                    }
                    if (updated) await userTeacher.save()
                }

                req.session.teacher = userTeacher._id
                req.session.userT = {
                    id: userTeacher._id,
                    fullName: userTeacher.fullName,
                    teacherCode: userTeacher.teacherCode,
                    teacherEmail: userTeacher.teacherEmail,
                    teacherDept: userTeacher.teacherDepartment,
                    teacherDegree: userTeacher.teacherDegree
                }

                // Kiểm tra mật khẩu (Thiết lập 1 lần)
                if (userTeacher.password) {
                    return res.redirect('/teacher/dashboard')
                }
                return res.redirect('/api/auth/reg')

            } else if (email) {
                console.log('Vai trò: Sinh viên')
                
                let userStudent = await studentData.findOne({
                    studentEmail: email,
                })

                if(!userStudent){
                    const msv = email.split('@')[0]
                    const sMajor = user.data.department || user.data.jobTitle || 'Kỹ thuật phần mềm'
                    userStudent = await studentData.create({
                        fullName: user.data.displayName,
                        studentEmail: email,
                        studentPhone: user.data.mobilePhone || '',
                        studentCode: msv,
                        studentMajor: sMajor, 
                        studentClass: user.data.officeLocation || 'Chưa cập nhật',
                        isMicrosoft: true, // [NEW] Đánh dấu tài khoản Microsoft
                    })
                } else {
                    // Chỉ cập nhật nếu dữ liệu hiện tại đang trống hoặc "Chưa cập nhật"
                    let updated = false
                    if ((!userStudent.fullName || userStudent.fullName === 'Chưa cập nhật') && user.data.displayName) {
                        userStudent.fullName = user.data.displayName; updated = true;
                    }
                    if ((!userStudent.studentPhone || userStudent.studentPhone === 'Chưa cập nhật') && user.data.mobilePhone) {
                        userStudent.studentPhone = user.data.mobilePhone; updated = true;
                    }
                    if ((!userStudent.studentMajor || userStudent.studentMajor === 'Chưa cập nhật')) {
                        const mMajor = user.data.department || user.data.jobTitle;
                        if (mMajor) {
                            userStudent.studentMajor = mMajor; updated = true;
                        }
                    }
                    if ((!userStudent.studentClass || userStudent.studentClass === 'Chưa cập nhật') && user.data.officeLocation) {
                        userStudent.studentClass = user.data.officeLocation; updated = true;
                    }
                    if (!userStudent.isMicrosoft) {
                        userStudent.isMicrosoft = true; updated = true;
                    }
                    if (updated) await userStudent.save()
                }

                req.session.student = userStudent._id
                
                req.session.user = {
                    id: userStudent._id,
                    fullName: userStudent.fullName,
                    studentCode: userStudent.studentCode,
                    studentEmail: userStudent.studentEmail,
                    studentClass: userStudent.studentClass,
                    studentMajor: userStudent.studentMajor
                }

                // Kiểm tra đồ án
                if (userStudent.projectId) {
                    return res.redirect('/student/project')
                }

                // Kiểm tra mật khẩu (Thiết lập 1 lần)
                if (userStudent.password) {
                    return res.redirect('/student/dashboard')
                }
                return res.redirect('/api/auth/reg')
            } else {
                return res.status(400).send('Không thể xác định thông tin email từ Microsoft')
            }

        } catch (err) {
            console.log(err.response?.data || err)
            res.status(500).send('lỗi callback')
        }
    }
}

module.exports = new microsoftController