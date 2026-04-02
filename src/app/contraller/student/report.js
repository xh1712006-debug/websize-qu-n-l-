// filepath: d:\hoc_html\on_html\project2\src\app\contraller\student\report.js
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
                return res.redirect('/accounts/singger')
            }
            let data = await Content.find()
            data = data.map(item => item.toObject())
            res.render('student/report', {
                layout: 'student/main',
                data: data,
                active: 'report',
                figure: 'student',
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
                title: req.body.title,
                content: req.body.content,
                type: req.body.type,
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