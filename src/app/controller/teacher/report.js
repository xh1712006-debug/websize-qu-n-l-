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
                layout: 'base',
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
            const reports = await report__Data.find({
                teacherId: teacherId,
                status: { $ne : 'loại'}
            }).sort({ createdAt: -1 }) // Sắp xếp báo cáo mới nhất lên đầu
            
            let reportData = []
            let students = []

            for(let i=0; i < reports.length; i++){
                const r = reports[i]
                
                // Lấy thông tin sinh viên
                const student = await student__Data.findById(r.studentId)
                if (!student) {
                    console.warn(`Report ${r._id} missing student record. skipping.`)
                    continue
                }

                // Lấy thông tin tiến độ và tên đồ án (An toàn)
                let projectName = 'Chưa có thông tin đồ án'
                const progress = await progressData.findOne({ studentId: r.studentId })
                
                if (progress && progress.projectId) {
                    const project = await projectData.findById(progress.projectId)
                    if (project) {
                        projectName = project.inputProject
                    }
                } else if (student.projectId) {
                    // Fallback: Lấy trực tiếp từ student.projectId nếu progress chưa có
                    const project = await projectData.findById(student.projectId)
                    if (project) {
                        projectName = project.inputProject
                    }
                }

                students.push({
                    id: student._id,
                    fullName: student.fullName,
                    studentCode: student.studentCode,
                    projectName: projectName,
                })
                reportData.push(r)
            }

            return res.json({
                students,
                report: reportData,
            })
        }
        catch(err){
            console.error('getReport Error:', err)
            res.status(500).json({ error: 'Lỗi nạp báo cáo: ' + err.message })
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
<<<<<<< HEAD:src/app/contraller/teacher/report.js
            const { reportId, studentId, feedback } = req.body 
=======
            const { reportId, studentId, feedback } = req.body
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/report.js
            
            const report = await report__Data.findOneAndUpdate({
                _id: reportId,
            },{
                status: 'đã duyệt',
<<<<<<< HEAD:src/app/contraller/teacher/report.js
                teacherFeedback: feedback,
            },{ new: true })

            // Cập nhật trạng thái lộ trình nếu có liên kết
            if (report && report.requirementId) {
                await requirementStudentData.findByIdAndUpdate(report.requirementId, {
                    status: 'completed'
                })
            }

            // Cập nhật tiến độ: (Số mốc hoàn thành / Tổng số mốc) * 100
            const totalRequirements = await requirementStudentData.countDocuments({ studentId: studentId })
            const completedRequirements = await requirementStudentData.countDocuments({ studentId: studentId, status: 'completed' })
            
            let percent = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0
=======
                teacherFeedback: feedback
            },{ new: true })

            // Count approved reports (max 10) to update progress
            const allApproved = await report__Data.find({ studentId: studentId, status: 'đã duyệt' })
            let percent = allApproved.length * 10
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/report.js
            if(percent > 100) percent = 100

            await progressData.findOneAndUpdate({
                studentId: studentId,
            },{
<<<<<<< HEAD:src/app/contraller/teacher/report.js
                percent: percent
            }, { upsert: true })

            // [NEW] Cập nhật trạng thái khi đạt 100% (Không tự động phê duyệt điều kiện bảo vệ)
            if (percent === 100) {
                // 1. Cập nhật trạng thái Progress (pass)
                await progressData.findOneAndUpdate({ studentId: studentId }, { status: 'pass' })

                // 2. Gửi thông báo nhắc nhở sinh viên chờ GVHD duyệt hồ sơ bảo vệ
                const notificationModel = require('../../models/notification')
                const notification = new notificationModel({
                    receiverId: studentId,
                    title: '✨ Hoàn thành 100% báo cáo',
                    message: 'Bạn đã hoàn thành tất cả yêu cầu báo cáo. Hãy chờ GVHD phê duyệt chính thức để đủ điều kiện ra Phản biện & Bảo vệ.',
                    type: 'success',
                    link: '/student/project'
                })
                await notification.save()
            }

            return res.json({ 
                message: 'Đã duyệt báo cáo thành công',
                isCompleted: percent === 100 
            })
=======
                precent: percent
            })

            return res.json({ message: 'Đã duyệt báo cáo thành công' })
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/teacher/report.js
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
