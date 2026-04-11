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


    async postRequirement(req, res){
        try{
            const { reportId, studentId, feedback } = req.body
            
            const report = await report__Data.findOneAndUpdate({
                _id: reportId,
            },{
                status: 'đã duyệt',
                teacherFeedback: feedback
            },{ new: true })

            // Count approved reports (max 10) to update progress
            const allApproved = await report__Data.find({ studentId: studentId, status: 'đã duyệt' })
            let percent = allApproved.length * 10
            if(percent > 100) percent = 100

            await progressData.findOneAndUpdate({
                studentId: studentId,
            },{
                precent: percent
            })

            return res.json({ message: 'Đã duyệt báo cáo thành công' })
        }
        catch(err){
            console.log(err)
            res.status(500).json({ error: 'Lỗi server' })
        }
    }

    async postRemove(req, res){
        try{
            const { reportId, feedback } = req.body
            const report = await report__Data.findOneAndUpdate({
                _id: reportId,
            },{
                status: 'yêu cầu nộp lại',
                teacherFeedback: feedback
            },{
                new: true,
            })
            return res.json({
                message: 'Đã từ chối báo cáo'
            })
        }
        catch(err){
            console.log(err)
            res.status(500).json({ error: 'Lỗi server' })
        }
    }
}

module.exports = new reportController
