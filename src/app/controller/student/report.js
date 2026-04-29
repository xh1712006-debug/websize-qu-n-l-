// filepath: d:\hoc_html\on_html\project2\src\app\controller\student\report.js
const Content = require('../../models/report')
const multer = require('multer')
const path = require('path')
const progressData = require('../../models/progress')

// Ensure upload directory exists

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/file')  // Use absolute path
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })
class reportController {
    async index(req, res) {
        try {
<<<<<<< HEAD:src/app/contraller/student/report.js
            const studentId = req.session.student
            if (!studentId) {
                return res.redirect('/accounts/singger')
            }

            const requirementStudentData = require('../../models/requirementStudent')
            const reports = await Content.find({ studentId: studentId })
            const requirements = await requirementStudentData.find({ studentId: studentId })

            let targetRequirement = null
            const requirementId = req.query.requirementId

            if (requirementId) {
                targetRequirement = await requirementStudentData.findById(requirementId)
            }

            // Nếu không có mốc chỉ định, tìm mốc chưa hoàn thành đầu tiên
            if (!targetRequirement) {
                targetRequirement = requirements.find(req => req.status !== 'completed')
            }

            // Tính toán tuần từ tên mốc (ví dụ: "Tuần 4" -> 4)
            let currentWeek = 0
            let weekLabel = '---'
            if (targetRequirement) {
                const match = targetRequirement.name.match(/\d+/)
                currentWeek = match ? parseInt(match[0]) : 0
                weekLabel = targetRequirement.name
            } else {
                // Mặc định nộp theo số lượng đã hoàn thành nếu không có lộ trình
                const approvedReports = reports.filter(r => r.status === 'đã duyệt')
                currentWeek = approvedReports.length + 1
                weekLabel = `Tuần ${currentWeek}`
            }

            const hasPending = reports.some(r => r.status === 'chờ duyệt')
            const canSubmit = !hasPending && !!targetRequirement

            // Fetch progress for completion status
            const progress = await progressData.findOne({ studentId: studentId })
            const isFinished = progress && progress.percent === 100
=======
            if (!req.session.student) {
                return res.redirect('/loggin')
            }
            let data = await Content.find({ studentId: req.session.student })
            data = data.map(item => item.toObject())

            // Tính toán số tuần
            const approvedReports = data.filter(r => r.status === 'đã duyệt')
            let currentWeek = approvedReports.length + 1
            if (currentWeek > 10) currentWeek = 10;

            const hasPending = data.some(r => r.status === 'chờ duyệt')
            const canSubmit = !hasPending
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/report.js

            res.render('student/report', {
                layout: 'base',
                data: reports.map(r => r.toObject()),
                active: 'report',
                figure: 'student',
                currentWeek: currentWeek,
<<<<<<< HEAD:src/app/contraller/student/report.js
                weekLabel: weekLabel,
                requirementId: targetRequirement ? targetRequirement._id : null,
                canSubmit: canSubmit,
                isFinished: isFinished,
                percent: progress ? progress.percent : 0
=======
                canSubmit: canSubmit
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/report.js
            })
        } catch (err) {
            console.error('Report Index Error:', err)
            res.status(500).send('Error loading page')
        }
    }

    async newReport(req, res) {
        try {
            const studentId = req.session.student
            const { week, content, requirementId, externalLink } = req.body
            
            if (!studentId) return res.status(400).json({ error: 'Session invalid' })

            // [FIX] Lấy thông tin sinh viên và đồ án để tìm GVHD chính xác nhất
            const studentData = require('../../models/student')
            const projectData = require('../../models/project')
            const notificationModel = require('../../models/notification')
            
            const student = await studentData.findById(studentId)
            if (!student) return res.status(400).json({ error: 'Không tìm thấy sinh viên' })

            let teacherId = student.teacherId

            // Nếu student.teacherId bị reset (do đóng đợt), tìm từ Project
            if (!teacherId && student.projectId) {
                const project = await projectData.findById(student.projectId)
                if (project) {
                    teacherId = project.teacherId
                }
            }

            if (!teacherId) return res.status(400).json({ error: 'Hệ thống không xác định được Giảng viên hướng dẫn của bạn. Vui lòng liên hệ Admin.' })
            
            if (!req.file && !externalLink) {
                return res.status(400).json({ error: 'Vui lòng nộp tệp báo cáo hoặc cung cấp liên kết (Github/Drive)' })
            }

            const title = `Báo cáo: ${req.body.weekLabel || 'Báo cáo tuần ' + week}`

            const createReport = new Content({
                studentId: studentId,
                teacherId: teacherId,
                requirementId: requirementId || null,
                status: 'chờ duyệt',
<<<<<<< HEAD:src/app/contraller/student/report.js
                fileUrl: req.file ? req.file.filename : null,
                externalLink: externalLink || null,
                title: title,
                content: content,
                week: Number(week),
=======
                fileUrl: req.file.filename,
                title: `Báo cáo Tuần ${req.body.week}`,
                content: req.body.content,
                week: Number(req.body.week),
>>>>>>> a9878b857c2378f0d32ffa064e7ca4ddfdddac26:src/app/controller/student/report.js
            })
            await createReport.save()

            // [NEW] Gửi thông báo cho GVHD
            const teacherNotification = new notificationModel({
                receiverId: teacherId,
                title: '📩 Báo cáo tiến độ mới',
                message: `Sinh viên ${student.fullName} vừa nộp "${title}". Vui lòng kiểm tra và phản hồi.`,
                type: 'info',
                link: '/teacher/report'
            })
            await teacherNotification.save()

            return res.json({ success: true, message: 'Nộp báo cáo thành công và đã thông báo tới GVHD' })
        } catch (err) {
            console.error('Create report error:', err)
            return res.status(500).json({ error: 'Lỗi server: ' + err.message })
        }
    }

    async getReport(req, res) {
        try {
            const studentId = req.session.student
            if (!studentId) {
                return res.status(400).json({ error: 'Session invalid' })
            }
            const report = await Content.find({ studentId: studentId })
            return res.json({ report })
        } catch (err) {
            console.error(err)
            res.status(500).json({ error: 'Error fetching reports' })
        }
    }
    async downloadFile(req, res){
        const fileUrl = req.params.fileUrl
        console.log(fileUrl)
        const filePath = path.join(__dirname, '../../../../upload/file', fileUrl)
        console.log(filePath)
        res.download(filePath)
    }
}

module.exports = {
    controller: new reportController(),
    upload: upload
}
