// filepath: d:\hoc_html\on_html\project2\src\app\contraller\student\report.js
const Content = require('../../models/report')
const multer = require('multer')
const path = require('path')
const fs = require("fs")

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', '..', 'upload', 'file')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir)  // Use absolute path
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, uniqueName)
    }
})

// Add file filters and limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'))
        }
    }
})

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
            const studentId = req.session.student
            const teacherId = req.session.teacherId
            if (!studentId || !teacherId) {
                return res.status(400).json({ error: 'Session invalid' })
            }

            const { title, content, type } = req.body
            if (!title || !content || !type || !req.file) {
                return res.status(400).json({ error: 'Missing required fields or file' })
            }

            const fileUrl = req.file.filename  // Use the uploaded file's name

            const createReport = new Content({
                studentId: studentId,
                teacherId: teacherId,
                fileUrl: fileUrl,
                title: title,
                content: content,
                type: type,
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
}

module.exports = {
    controller: new reportController(),
    upload: upload
}