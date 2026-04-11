const contentTeacher = require('../../models/teacher')

class teacherController{
    async index(req,res) {
        try {
            res.render('admin/teachers/teacher', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'teachers/teacher'
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async addTeacher(req,res) {
        try{
            res.render('admin/teachers/addTeacher', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'teachers/addTeacher'
            })
            
        }
        catch(err){
                res.status(500).send('loi')
            }
    }

    async getTeachers(req,res) {
        try{
            const teachers = await contentTeacher.find()
        }
        catch(err){
            res.status(500).send('loi')
        }
    }

    async postAddTeacher(req,res) {
        try{
            const { name, email, phone, role, department, degree, avatar, code } = req.body
            const newTeacher = new contentTeacher({
                fullName: name,
                teacherEmail: email,
                teacherPhone: phone,
                teacherCode: code,
                // teacherDate: date,
                // teacherGender: gender,
                teacherRole: role,
                teacherAvatar: avatar,
                teacherDepartment: department,
                teacherDegree: degree
            })
            await newTeacher.save()
            console.log('chuyền thành công')
            // res.redirect('/admin/teacher')
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
    }

}

module.exports = new teacherController
