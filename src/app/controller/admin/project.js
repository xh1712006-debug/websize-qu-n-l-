const content_admin = require('../../models/admin')
const projectAdmin = require('../../models/project')
const studentData = require('../../models/student')
const progressData = require('../../models/progress')
const requirementStudentData = require('../../models/requirementStudent')
const requirementData = require('../../models/requirement')
const scoreData = require('../../models/grade')
const reportData = require('../../models/report')
const assignmentData = require('../../models/assignment')
const feedbackData = require('../../models/feedback')
const aconversationData = require('../../models/conversation')

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
            const teacherFeedbackName = req.body.teacherFeedbackName
            const date = req.body.date
            const statuss = req.body.statuss
            const requirement = req.body.requirement
            const technology = req.body.technology
            const numberStudent = req.body.numberStudent 
            const id = req.body.id
            const teacherFeedbackId = req.body.teacherFeedbackId

            console.log('teacherFeedbackId: ', teacherFeedbackId)

            const technologyList = technology.split()
            console.log('requirement: ', requirement)

            const newProject = new projectAdmin({
                inputProject: inputProject,
                contentProject: contentProject,
                teacherInstruct: teacherInstruct,
                date: date,
                statuss: statuss,
                numberStudent: numberStudent,
                teacherId: id,
                numberSubmit: 0,
                technology: technologyList,
                teacherFeedbackId: teacherFeedbackId,
                teacherFeedbackName: teacherFeedbackName,
            })


            requirement.forEach(item => {
                const newRequirement = new requirementData({
                    projectId: newProject._id,
                    name: item,
                    status: 'Fall',
                })
                newRequirement.save()
            });
            
            await newProject.save()
           
            console.log('newProject: ', newProject)
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
            const student = await studentData.updateMany(
                {
                    projectId: idProject,
                },
                {
                    teacherId: null,
                    projectId: null,
                    status: null,
                }
            )
            const requirement = await requirementData.deleteMany({
                projectId: idProject,
            })
            const requirementStudent = await requirementStudentData.deleteMany({
                projectId: idProject,
            })

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

}

module.exports = new projectController
