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

    async approveStudent(req, res){
        try{
            const studentId = req.body.studentId
            const student = await studentData.findByIdAndUpdate(
                studentId,
                {
                    status: "approved",
                },
                { new: true }
            )

            const numberSubmit = await projectAdmin.findById(student.projectId)
            console.log('student.projectId,: ', student.projectId,)
            const newProgress = new progressData({
                studentId: studentId,
                projectId: student.projectId,
                precent: 0,

            })
            await newProgress.save()
            const project = await projectAdmin.findByIdAndUpdate(
                student.projectId,
                {
                    numberSubmit: numberSubmit.numberSubmit+1,
                }
            )
            const requirement = await requirementData.find({
                projectId: student.projectId,
            })
            requirement.forEach(item => {
                const newRequirementStudent = new requirementStudentData({
                    projectId: student.projectId,
                    studentId: studentId,
                    name: item.name,
                    status: 'Fall',
                })
                newRequirementStudent.save()
            });
            
           
            if(!student){
                return res.status(404).json({ message: "Không tìm thấy sinh viên" })
            }

            const assignment = new assignmentData({
                studentId: studentId,
                teacherId: project.teacherFeedbackId,
                projectId: student.projectId,
                role: 'reviewer',
            })
            await assignment.save()

            const aconversation = new aconversationData({
                studentId: studentId,
                teacherId: project.teacherFeedbackId,
            })
            await aconversation.save()


            const score = new scoreData({
                studentId: studentId,
                teacherId: student.teacherId,
                projectId: student.projectId,
                score: null,
                scoreFeedback: null,
                status: false,
            })
            await score.save()

            console.log('tạo tiền teinhf mới là: ', newProgress)

            res.json({ message: "Duyệt thành công", data: student })
        
        }
        catch(err){
            console.log(err)
            res.status(500).send('lỗi')
        }
    }

    async rejectStudent(req, res){
        try{
            const studentId = req.query.studentId
            console.log('gia trị kiếm studentId: ', studentId)
            const pro = await studentData.findById(studentId)
            const projectId = pro.projectId
            console.log('projectId: ', projectId)

            
            if(pro.status == 'approved'){
                const numberS = await projectAdmin.findById(pro.projectId)
                const numberSubmit = numberS.numberSubmit
                const aconversation = await aconversationData.findOne({
                    studentId: studentId,
                })
                const project = await projectAdmin.findByIdAndUpdate(
                    projectId,
                    {
                        numberSubmit: numberSubmit - 1,
                    }
                )
                console.log('bắt đầu xoá')
                const pregress = await progressData.deleteMany({
                    studentId: studentId,
                })

                const score = await scoreData.deleteMany({
                    projectId: projectId,
                })
                const report = await reportData.deleteMany({
                    studentId: studentId,
                })
                const assignment = await assignmentData.deleteMany({
                    studentId: studentId,
                })
                if(aconversation){
                    const feedback = await feedbackData.deleteMany({
                        conversationId: aconversation._id,
                    })
                    const aconversation1 = await aconversationData.deleteMany({
                        studentId: studentId,
                    })
                }
                
               

            }
            const student = await studentData.findByIdAndUpdate(
                studentId,
                {
                    teacherId: null,
                    projectId: null,
                    status: null,
                }
            )
            const requirementStudent = await requirementStudentData.deleteMany({
                studentId: studentId,
            })
            
            
            res.json({ message: "Duyệt thành công", data: student })
        
        }
        catch(err){
            console.log(err)
            res.status(500).send('lỗi')
        }
    }

}

module.exports = new projectController