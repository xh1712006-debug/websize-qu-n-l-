// filepath: d:\hoc_html\on_html\project2\src\app\controller\student\report.js
const Content = require('../../models/report')
const multer = require('multer')
const path = require('path')

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

            res.render('student/report', {
                layout: 'student/main',
                data: data,
                active: 'report',
                figure: 'student',
                currentWeek: currentWeek,
                canSubmit: canSubmit
            })
        } catch (err) {
            console.log(err)
            res.status(500).send('Error loading page')
        }
    }

    async newReport(req, res) {
        try {

            console.log('giá trị: ', req.body.title, ' ', req.body.content, ' ', req.file.filename, ' ', req.body.type)

            const studentId = req.session.student
            const teacherId = req.session.teacherId
            if (!studentId || !teacherId) {
                return res.status(400).json({ error: 'Session invalid' })
            }

            const fileUrl = req.file.filename  // Use the uploaded file's name
            console.log('FileUrl: ', fileUrl)

            const createReport = new Content({
                studentId: studentId,
                teacherId: teacherId,
                status: 'chờ duyệt',
                fileUrl: req.file.filename,
                title: `Báo cáo Tuần ${req.body.week}`,
                content: req.body.content,
                week: Number(req.body.week),
            })
            await createReport.save()
            return res.json({ success: true, message: 'Report created successfully' })
        } catch (err) {
            console.error('Create error:', err)
            return res.status(500).json({ error: 'Server error: ' + err.message })
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
