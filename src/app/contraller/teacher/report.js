const report__Data = require('../../models/report')
const student__Data = require('../../models/student')
const progressData = require('../../models/progress')
const projectData = require('../../models/project')
const requirementData = require('../../models/requirement')
const requirementStudentData = require('../../models/requirementStudent')
const path = require('path')

class reportController {
    async index(req, res) {
        try {
            let data_report = await report__Data.find()
            data_report = data_report.map(item => item.toObject())
            res.render('teacher/report', {
                layout: 'teacher/main',
                active: 'report',
                data_report: data_report,
                figure: 'teacher',
                
            })
        }
        catch (err) {
            console.log(err)
            res.status(500).send('loi')
        }
    }

    async getReport(req, res){
        try {
            const teacherId = req.session.teacher
            console.log('teacherId: ', teacherId)
            const report = await report__Data.find({
                teacherId: teacherId,
                status: { $ne : 'loại'}
            })
            console.log('report: ', report)

            let students = []
            for(let i=0;i<report.length;i++){
                console.log('report[i].studentId: ',report[i].studentId)
                let studentId = await student__Data.findById(report[i].studentId)
                console.log('student: ', studentId)
                const progress = await progressData.findOne({
                    studentId: report[i].studentId,
                })
                const project = await projectData.findById(progress.projectId)
                const projectName = project.inputProject
                console.log('projectName: ', project.inputProject)
                students.push({
                    id: studentId._id,
                    fullName: studentId.fullName,
                    studentCode: studentId.studentCode,
                    projectName: projectName,
                })
            }

            console.log('giá trị sinh viên: ', students)

            console.log(report)
            return res.json({
                students,
                report,
            })
        }
        catch(err){
            console.log(err)
            res.status(500).send('loi')
        }
    }

    // async postReport(req, res){
    //     try{
    //         const status = req.body.status
    //         const id = req.body.id
    //         console.log(id)
    //         await report__Data.findByIdAndUpdate({
    //             _id: id,
    //         },{
    //             status: status,
    //         })
    //         res.json({
    //             message: "Cập nhật thành công"
    //         })
    //     }
    //     catch(err){

    //     }
    // }
    async viewFile(req, res){
        try{
            const fileUrl = req.params.fileUrl
            console.log('fileUrl: ',fileUrl)
            const filePath = path.join(__dirname,'../../../../upload/file',fileUrl)
            console.log('filePath: ',filePath)
            res.sendFile(filePath)
        }
        catch(err){

        }
    }

    async postAct(req, res){
        try {
            const id = req.body.id
            const report = await report__Data.findById(id)
            const student = await student__Data.findById(id)
            const newReport = new progressData({
                studentId: report.studentId,
                projectId: student.projectId,
                
            })
        }
        catch(err){
            
        }

    }
    async getRequirement(req, res){
        try{
            const studentId = req.query.studentId
            console.log('studentId: ', studentId)
            const requirementStudent = await requirementStudentData.find({
                studentId: studentId,
            })
            const student = await student__Data.findById(studentId)
            const projectId = student.projectId
            const project = await projectData.findById(projectId)
            console.log('project: ', project.inputProject)
            console.log('requirementStudent: ', requirementStudent)
            return res.json({
                requirementStudent,
                project,
            })

        }
        catch(err){
            console.log(err)
        }
    }

    async postRequirement(req, res){
        try{
            const listRequirement = req.body.listRequirementId
            const reportId = req.body.reportId
            console.log('reportId:: ', reportId)
            console.log('listRequirement: ', listRequirement)
            const studentId = req.body.studentId
            console.log(listRequirement)
            console.log(studentId)

            const report = await report__Data.findOneAndUpdate({
                _id: reportId,
            },{
                status: 'đã duyệt',
            })
            console.log('report:', report)


           for (const item of (listRequirement || [])) {
                await requirementStudentData.findByIdAndUpdate(
                    item,
                    { status: 'pass' },
                    { new: true } // optional
                )
            }
            let dem = 0
            const requirement = await requirementStudentData.find({
                studentId: studentId,
            })
            requirement.forEach(item => {
                console.log('item: ', item)
                if(item.status == 'pass'){
                    dem++;
                }

            })
            console.log('(dem/requirement.status.length)*100 = ', Math.round((dem/requirement.length)*100))
            const progress = await progressData.findOneAndUpdate({
                studentId: studentId,
            },{
                precent: Math.round((dem/requirement.length)*100)
            })

            return res.json({ message: 'Cập nhật thành công' })
        }
        catch(err){
            console.log(err)
        }
    }

    async postRemove(req, res){
        try{
            const reportId = req.body.reportId
            const report = await report__Data.findOneAndUpdate({
                _id: reportId,
            },{
                status: 'loại'
            },{
                new: true,
            })
            console.log('report khi loại: ', report)
            return res.json({
                message: 'cập nhật thành công thành remove'
            })
        }
        catch(err){
            console.log(err)
        }
    }
}

module.exports = new reportController