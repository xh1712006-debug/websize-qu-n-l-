const content_admin = require('../../models/admin')
const projectAdmin = require('../../models/project')
const studentData = require('../../models/student')

class projectController{
    async index(req,res) {
        try {
            res.render('admin/project/index', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/index'
            })
        }
        catch(err) {
            res.status(500).send('loi')
        }
    }
    async create(req, res) {
        try{
            res.render('admin/project/create', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/create'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async createProject(req, res){
        try {
            const inputProject = req.body.inputProject
            const contentProject = req.body.contentProject
            const teacherInstruct = req.body.teacherInstruct
            const date = req.body.date
            const statuss = req.body.statuss
            const numberStudent = req.body.numberStudent
            const id = req.body.id

            const newProject = new projectAdmin({
                inputProject: inputProject,
                contentProject: contentProject,
                teacherInstruct: teacherInstruct,
                date: date,
                statuss: statuss,
                numberStudent: numberStudent,
                teacherId: id,
            })
            await newProject.save()
            return res.status(201).json({
                message: 'Tạo project thành công',
                data: newProject
            })
        }
        catch(err){
            console.log(err)
            // res.starus(500).json( error: 'Server error')
        }
    }

    async deleteProject(req, res){
        try{
            console.log(req.params)
            console.log('id của body cần tim là:', req.params.id)
            const idProject = req.params.id
            const project = await projectAdmin.findByIdAndDelete(idProject)

            res.json({ message: "Xoá thành công" })

        }
        catch(err) {
            console.log(err)
        }
    }

    async listStudent(req, res) {
        try{
            res.render('admin/project/listStudent', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/listStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async fixStudent(req, res) {
        try{
            res.render('admin/project/fixStudent', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/fixStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async getFixStudent(req, res) {
        try{
            const id = req.body.id
            const project = projectAdmin.findById({
                id: id
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async putFixStudent(req, res) {
        try{
            const inputProject = req.body.inputProject
            const contentProject = req.body.contentProject
            const teacherInstruct = req.body.teacherInstruct
            const numberStudent = req.body.numberStudent
            const date = req.body.date
            const statuss = req.body.statuss
            const id = req.params.id

            console.log(id)
            const project = await projectAdmin.findById(id)

            project.inputProject = inputProject
            project.contentProject = contentProject
            project.teacherInstruct = teacherInstruct
            project.numberStudent = numberStudent
            project.statuss = statuss
            project.date = new Date(date)
            
            await project.save()
            console.log('đổi thành công')
            
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
        
    }

    async viewStudent(req, res) {
        try{
            res.render('admin/project/viewStudent', {
                layout: 'admin/main',
                figure: 'admin',
                active: 'project/viewStudent'
            })
        }
        catch(err){
            res.status(500).send('loi')
        }
        
    }
    async getListViewStudent(req, res){
        try{
            const projectId = req.query.projectId
            console.log('projectId: ', projectId)
            const student = await studentData.find({
                projectId: projectId,
            })
            console.log(student)
            res.json(student)
        }
        catch(err){
            res.status(500).send('loi')
        }
    }

    async approveStudent(req, res){
        try{
            const studentId = req.body.studentId
            const student = await studentData.findByIdAndUpdate(
                studentId,
                { status: "approved" },
                { new: true }
            )

            if(!student){
                return res.status(404).json({ message: "Không tìm thấy sinh viên" })
            }

            res.json({ message: "Duyệt thành công", data: student })
        
        }
        catch(err){
            res.status(500).send('lỗi')
        }
    }

    async rejectStudent(req, res){
        try{
            const studentId = req.body.studentId
            const student = await studentData.findByIdAndUpdate(
                studentId,
                { status: "reject" },
                { new: true }
            )

            if(!student){
                return res.status(404).json({ message: "Không tìm thấy sinh viên" })
            }

            res.json({ message: "Duyệt thành công", data: student })
        
        }
        catch(err){
            res.status(500).send('lỗi')
        }
    }

}

module.exports = new projectController